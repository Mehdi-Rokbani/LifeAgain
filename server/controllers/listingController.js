

/* ===========================================================
   CREATE LISTING
=========================================================== */
import Listing from "../models/Listing.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      phone,
      condition,
      address
    } = req.body;


    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Adresse requise"
      });
    }
    // Validate required fields
    if (!title || !description || !price || !category || !address) {
      return res.status(400).json({
        success: false,
        error: "Champs requis manquants"
      });
    }

    // Validate price
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Prix invalide"
      });
    }

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        error: "Catégorie invalide"
      });
    }

    // Validate address ID
    if (!mongoose.Types.ObjectId.isValid(address)) {
      return res.status(400).json({
        success: false,
        error: "Adresse invalide"
      });
    }

    // Handle file uploads (local storage)
    const coverFile = req.files?.cover?.[0]?.filename || null;
    const photoFiles = req.files?.photos?.map(f => f.filename) || [];

    // Build images array (direct URLs)
    const images = [];

    if (coverFile) {
      images.push(`/uploads/${coverFile}`);
    }

    photoFiles.forEach((filename) => {
      images.push(`/uploads/${filename}`);
    });

    // Create listing
    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      phone: phone || null,
      condition: condition || "used",
      category,
      seller: req.user.id,         // Logged-in seller
      address: address,                     // Address chosen by seller
      images,                      // Array of URLs
      locationText: "Tunisie",
      location: {
        type: "Point",
        coordinates: [10.1815, 36.8065]
      }
    });

    return res.status(201).json({
      success: true,
      message: "Annonce créée avec succès",
      listing
    });

  } catch (err) {
    console.error("❌ createListing ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'annonce"
    });
  }
};


/* ===========================================================
   GET ALL LISTINGS
=========================================================== */
export const getListings = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    let filter = {};

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ name: new RegExp(category, 'i') });
        if (cat) filter.category = cat._id;
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("images")
      .populate("category")
      .lean();

    console.log(`📊 ${listings.length} annonces récupérées`);

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (err) {
    console.error("❌ getListings ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des annonces"
    });
  }
};

/* ===========================================================
   GET LISTING BY ID
=========================================================== */
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 Récupération annonce ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide"
      });
    }

    const listing = await Listing.findById(id)
      .populate("images")
      .populate("category")
      .lean();

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Annonce introuvable"
      });
    }

    console.log("✅ Annonce trouvée:", listing.title);

    res.json({
      success: true,
      listing
    });
  } catch (err) {
    console.error("❌ getListingById ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'annonce"
    });
  }
};

/* ===========================================================
   DEEPSEEK API - Version simplifiée et robuste
=========================================================== */
const searchWithDeepSeek = async (productName, priceUsed, category) => {
  try {
    console.log(`🔍 Recherche DeepSeek pour: ${productName}`);

    const prompt = `
      Tu es un expert du marché tunisien. Analyse ce produit d'occasion et donne une estimation réaliste.

      PRODUIT: ${productName}
      PRIX OCCASION: ${priceUsed} TND
      CATÉGORIE: ${category || 'Non spécifiée'}

      Réponds UNIQUEMENT en JSON valide avec ce format:

      {
        "productName": "Nom réaliste du produit neuf",
        "newPrice": 999.99,
        "store": "Mytek ou Tunisianet ou Wiki",
        "recommendation": "Bon achat | À considérer | À éviter",
        "advice": "Conseil pratique en français",
        "marketStatus": "Marché favorable | Normal | Difficile"
      }

      Sois réaliste avec les prix du marché tunisien!
    `;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Réponse API invalide');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('🤖 Réponse AI brute:', aiResponse);

    // Extraction du JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format JSON non trouvé');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validation des champs requis
    if (!result.newPrice || !result.productName) {
      throw new Error('Champs manquants dans la réponse');
    }

    // Calculs
    const priceDifference = result.newPrice - priceUsed;
    const savingsPercentage = Math.round((priceDifference / result.newPrice) * 100);

    return {
      ...result,
      priceDifference,
      savingsPercentage,
      isFallback: false
    };

  } catch (error) {
    console.error('❌ Erreur DeepSeek:', error);

    // Fallback réaliste
    const fallbackPrice = Math.round(priceUsed * 1.3); // +30% pour le neuf
    const fallbackDifference = fallbackPrice - priceUsed;
    const fallbackPercentage = Math.round((fallbackDifference / fallbackPrice) * 100);

    return {
      productName: `${productName} (Neuf)`,
      newPrice: fallbackPrice,
      store: "Marché Tunisien",
      recommendation: "À considérer",
      advice: "Les données temps réel ne sont pas disponibles. Vérifiez manuellement sur Mytek.tn ou Tunisianet.com pour une comparaison précise.",
      marketStatus: "Données estimées",
      priceDifference: fallbackDifference,
      savingsPercentage: fallbackPercentage,
      isFallback: true
    };
  }
};

/* ===========================================================
   COMPARAISON AVEC DEEPSEEK
=========================================================== */
export const compareListing = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 Début comparaison pour ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID d'annonce invalide"
      });
    }

    const listing = await Listing.findById(id).populate("category");

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Annonce introuvable"
      });
    }

    console.log("📦 Analyse du produit:", {
      title: listing.title,
      price: listing.price,
      category: listing.category?.name
    });

    // Appel à DeepSeek
    const deepSeekResult = await searchWithDeepSeek(
      listing.title,
      listing.price,
      listing.category?.name
    );

    console.log("✅ Résultat analyse:", deepSeekResult);

    // Génération URL magasin
    const getStoreUrl = (store) => {
      const stores = {
        'Mytek': 'https://www.mytek.tn',
        'Tunisianet': 'https://www.tunisianet.com.tn',
        'Wiki': 'https://www.wiki.tn',
        'Teknio': 'https://www.teknio.tn',
        'Marché Tunisien': `https://www.google.com/search?q=${encodeURIComponent(listing.title)}+prix+Tunisie`
      };
      return stores[store] || `https://www.google.com/search?q=${encodeURIComponent(listing.title)}+Tunisie`;
    };

    const response = {
      success: true,
      comparison: {
        newPriceEstimate: `${deepSeekResult.newPrice} TND`,
        priceDifference: deepSeekResult.priceDifference,
        savingsPercentage: deepSeekResult.savingsPercentage,
        advice: deepSeekResult.advice,
        recommendation: deepSeekResult.recommendation,
        marketStatus: deepSeekResult.marketStatus,
        dataSource: `DeepSeek AI • ${deepSeekResult.store}`,
        isFallback: deepSeekResult.isFallback
      },
      realProduct: {
        name: deepSeekResult.productName,
        price: deepSeekResult.newPrice,
        store: deepSeekResult.store,
        url: getStoreUrl(deepSeekResult.store),
        snippet: deepSeekResult.advice,
        source: 'DeepSeek AI - Analyse marché Tunisien'
      },
      originalListing: {
        title: listing.title,
        price: listing.price,
        category: listing.category?.name,
        condition: listing.condition,
        description: listing.description
      },
      timestamp: new Date().toISOString()
    };

    console.log("📤 Envoi réponse comparaison");
    res.json(response);

  } catch (err) {
    console.error("❌ compareListing ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'analyse du produit",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Export par défaut pour les routes
export default {
  createListing,
  getListings,
  getListingById,
  compareListing
};