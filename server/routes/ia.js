import express from "express";
import axios from "axios";
const router = express.Router();

const parsePriceString = (s) => {
  if (!s) return null;
  const re = /([0-9]{1,3}(?:[.,][0-9]{1,3})*(?:\s*[0-9]{3})?)(?:\s*(TND|DT|dinar|د\.ت|د.ت|TND|USD|EUR|€|\$|US\$))?(?:[^\d]{0,10}?(\/\s?mois|par mois|mois))?/i;
  const m = String(s).replace(/\u00A0/g, ' ').match(re);
  if (!m) return null;
  let rawAmount = m[1].replace(/\s/g, '').replace(',', '.');
  const amount = parseFloat(rawAmount);
  const symbol = (m[2] || '').toLowerCase();
  let currency = 'TND';
  if (/^\$|usd|us\$/.test(symbol)) currency = 'USD';
  if (/€|eur/.test(symbol)) currency = 'EUR';
  const isMonthly = !!(m[3]);
  return { amount, currency, isMonthly, raw: s };
};

const extractPriceCandidateStrings = (r) => {
  if (!r) return [];
  return [
    r.price,
    r.extracted_price,
    r.extracted_price_string,
    r.price_string,
    r.offers?.[0]?.price,
    r.offers?.[0]?.price_string,
    r.snippet,
    r.title
  ].filter(Boolean).map(x => String(x));
};

const extractPriceObject = (r) => {
  const candidates = extractPriceCandidateStrings(r);
  for (const c of candidates) {
    const p = parsePriceString(c);
    if (p && !isNaN(p.amount)) return p;
  }
  return null;
};

const extractLink = (r) => {
  if (!r) return "";
  return r.link || r.product_link || r.link_with_landing_page || r.landing_page ||
         (r.offers && r.offers[0]?.link) || r.buy_link || r.source_link || r.url || r.displayed_link || "";
};

const convertToTND = async (amount, from) => {
  if (!amount || !from) return null;
  if (from.toUpperCase() === 'TND') return { amount: +amount, currency: 'TND' };
  try {
    const conv = await axios.get('https://api.exchangerate.host/convert', {
      params: { from: from.toUpperCase(), to: 'TND', amount }
    });
    if (conv.data && conv.data.result != null) {
      return { amount: Number(conv.data.result), currency: 'TND' };
    }
  } catch (e) {
    console.warn('Conversion rate error:', e.message);
  }
  return null;
};

router.post("/analyze", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "title manquant" });

  try {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "SERP_API_KEY manquante" });

    const siteTargets = "site:.tn OR site:jumia.com.tn OR site:mytek.tn";
    const query = `${title} ${siteTargets}`;

    // 1) google_shopping
    const shoppingResp = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q: query,
        api_key: apiKey,
        hl: "fr",
        currency: "TND"
      },
      timeout: 15000
    });

    const shoppingList = shoppingResp.data.shopping_results || [];
    let result = shoppingList.find(r =>
      r.price || r.extracted_price || r.extracted_price_string ||
      r.price_string || (r.offers && r.offers.length)
    ) || shoppingList[0] || null;

    // 2) fallback -> google organique
    let fallbackOrg = null;
    if (!result) {
      const googleResp = await axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google",
          q: query,
          api_key: apiKey,
          hl: "fr"
        },
        timeout: 15000
      });
      fallbackOrg = (googleResp.data.organic_results || [])[0] || null;
    }

    // extract + normalize price
    let priceObj = extractPriceObject(result) || extractPriceObject(fallbackOrg) || null;
    if (!priceObj && result?.offers?.length) {
      const offer = result.offers[0];
      if (offer?.price || offer?.price_string) {
        priceObj = parsePriceString(String(offer.price || offer.price_string));
      }
    }

    let prixNeufNormalized = null;
    if (priceObj) {
      const conv = await convertToTND(priceObj.amount, priceObj.currency || 'TND');
      if (conv) {
        const rounded = Math.round(conv.amount * 100) / 100;
        prixNeufNormalized = priceObj.isMonthly ? `${rounded} TND / mois` : `${rounded} TND`;
      } else {
        prixNeufNormalized = priceObj.isMonthly ? `${priceObj.amount} ${priceObj.currency} / mois` : `${priceObj.amount} ${priceObj.currency}`;
      }
    }

    // build link
    const lienRaw = extractLink(result) || extractLink(fallbackOrg) || "";
    let lien = lienRaw;
    if (lien && !/^https?:\/\//i.test(lien)) {
      lien = lien.startsWith("//") ? "https:" + lien : "https://" + lien;
    }

    const data = {
      produit: title,
      prixNeuf: prixNeufNormalized || "Non trouvé",
      vendeur: result?.source || result?.store || fallbackOrg?.displayed_link || "Inconnu",
      lien: lien || ""
    };

    return res.json(data);

  } catch (err) {
    console.error("Erreur IA:", err.response?.data || err.message || err);
    return res.status(500).json({ message: "Erreur IA" });
  }
});

export default router;
