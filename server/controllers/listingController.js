/* ===========================================================
   CREATE LISTING — WITH IMAGE MODEL STORAGE
=========================================================== */
import Listing from "../models/Listing.js";
import Category from "../models/Category.js";
import Image from "../models/Image.js";
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
      address,
    } = req.body;

    if (!title || !description || !price || !category || !address) {
      return res.status(400).json({
        success: false,
        error: "Champs requis manquants",
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0.5) {
      return res.status(400).json({
        success: false,
        error: "Prix invalide (min 0.5 TND)",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(category) ||
      !mongoose.Types.ObjectId.isValid(address)
    ) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    // 🔒 Normalize title
    const titleNormalized = title.trim().toLowerCase();

    // 🔒 DUPLICATE CHECK (seller + title)
    const existing = await Listing.findOne({
      seller: req.user.id,
      titleNormalized,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Vous avez déjà une annonce avec ce titre",
      });
    }

    const coverFile = req.files?.cover?.[0];
    const photoFiles = req.files?.photos || [];

    if (!coverFile) {
      return res.status(400).json({
        success: false,
        error: "Une photo de couverture est obligatoire",
      });
    }

    const imageUrls = [
      `/uploads/${coverFile.filename}`,
      ...photoFiles.map((f) => `/uploads/${f.filename}`),
    ];

    const listing = await Listing.create({
      title: title.trim(),
      titleNormalized,
      description: description.trim(),
      price: numericPrice,
      condition: condition || "used",
      category,
      seller: req.user.id,
      address,
      images: imageUrls,
      locationText: "Tunisie",
      location: {
        type: "Point",
        coordinates: [10.1815, 36.8065],
      },
    });

    // Store images in Image collection
    const imageDocs = [
      {
        listing: listing._id,
        url: imageUrls[0],
        isCover: true,
        order: 0,
      },
      ...photoFiles.map((f, i) => ({
        listing: listing._id,
        url: `/uploads/${f.filename}`,
        isCover: false,
        order: i + 1,
      })),
    ];

    await Image.insertMany(imageDocs);

    res.status(201).json({
      success: true,
      message: "Annonce créée avec succès",
      listing,
    });
  } catch (err) {
    console.error("❌ createListing ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'annonce",
    });
  }
};



///////////////////////////
/* ===========================================================
            update cover image wiwiwiwiwiw
============================================================== */
export const updateCoverImage = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Annonce introuvable" });
    }

    const newCover = req.files?.cover?.[0];
    if (!newCover) {
      return res.status(400).json({ success: false, error: "Nouvelle image requise" });
    }

    const newUrl = `/uploads/${newCover.filename}`;

    // Replace first element in Listing.images
    listing.images[0] = newUrl;
    await listing.save();

    // Update Image model: remove old cover, set new one
    await Image.updateMany(
      { listing: listingId },
      { $set: { isCover: false } }
    );

    await Image.create({
      listing: listingId,
      url: newUrl,
      isCover: true,
      order: 0
    });

    return res.json({
      success: true,
      message: "Image de couverture mise à jour",
      images: listing.images
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
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
        const cat = await Category.findOne({ name: new RegExp(category, "i") });
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
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("seller", "username") // 🔥 IMPORTANT
      .lean();

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (err) {
    console.error("❌ getListings ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des annonces",
    });
  }
};



/* ===========================================================

                    add images wiwiwiiwi

============================================================= */
export const addListingImages = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Annonce introuvable" });
    }

    const newPhotos = req.files?.photos || [];
    if (newPhotos.length === 0) {
      return res.status(400).json({ success: false, error: "Aucune image fournie" });
    }

    const baseOrder = listing.images.length; // cover is index 0

    const newUrls = [];
    const newImageDocs = [];

    newPhotos.forEach((file, index) => {
      const url = `/uploads/${file.filename}`;
      newUrls.push(url);

      newImageDocs.push({
        listing: listingId,
        url,
        isCover: false,
        order: baseOrder + index
      });
    });

    listing.images.push(...newUrls);
    await listing.save();

    await Image.insertMany(newImageDocs);

    return res.json({
      success: true,
      message: "Images ajoutées",
      images: listing.images
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};


/* ===========================================================
delete listing image wiwiwiwiwiw
============================================================-*/
export const deleteListingImage = async (req, res) => {
  try {
    const { listingId, imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ success: false, error: "Image introuvable" });
    }

    // Prevent deleting cover without replacement
    if (image.isCover) {
      return res.status(400).json({
        success: false,
        error: "Impossible de supprimer l'image de couverture. Mettez-en une nouvelle d'abord."
      });
    }

    const listing = await Listing.findById(listingId);
    listing.images = listing.images.filter(url => url !== image.url);
    await listing.save();

    await image.deleteOne();

    return res.json({
      success: true,
      message: "Image supprimée",
      images: listing.images
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};



/* ===========================================================
   GET LISTING BY ID
=========================================================== */

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const listing = await Listing.findById(id)
      .populate("category", "name")
      .populate("seller", "username") // 🔥 IMPORTANT
      .lean();

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Annonce introuvable",
      });
    }

    res.json({
      success: true,
      listing,
    });
  } catch (err) {
    console.error("❌ getListingById ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'annonce",
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



export const getSellerListings = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const listings = await Listing.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("seller", "username")
      .lean();

    res.json({ success: true, listings });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};




//-------------------------------------- update listing wiwiwiwiwiw -------------------------------------------------------//


/* ===============================
   UPDATE LISTING (SELLER)
   =============================== */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    // 🔐 Owner check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not allowed to edit this listing",
      });
    }

    // 🚫 Sold listings cannot be edited
    if (listing.status === "sold") {
      return res.status(400).json({
        success: false,
        error: "Sold listings cannot be edited",
      });
    }

    const {
      title,
      description,
      price,
      condition,
      category,
    } = req.body;

    // ================= TITLE (UNIQUE PER SELLER) =================
    if (title && title !== listing.title) {
      const titleNormalized = title.trim().toLowerCase();

      const duplicate = await Listing.findOne({
        _id: { $ne: listing._id },
        seller: req.user.id,
        titleNormalized,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "You already have a listing with this title",
        });
      }

      listing.title = title.trim();
      listing.titleNormalized = titleNormalized;
    }

    // ================= PRICE =================
    if (price !== undefined) {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0.5) {
        return res.status(400).json({
          success: false,
          error: "Invalid price (minimum 0.5 TND)",
        });
      }
      listing.price = p;
    }

    // ================= OTHER FIELDS =================
    if (description !== undefined) listing.description = description;
    if (condition !== undefined) listing.condition = condition;
    if (category !== undefined) listing.category = category;

    await listing.save();

    res.json({
      success: true,
      message: "Listing updated successfully",
      listing,
    });

  } catch (err) {
    console.error("UPDATE LISTING ERROR:", err);

    // extra safety for unique index
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Duplicate listing title for this seller",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};



import Panier from "../models/Panier.js";
import Favorite from "../models/Favorites.js";

export const deleteListing = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const listing = await Listing.findById(req.params.id).session(session);

    if (!listing) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // 🔐 Owner check (seller)
    if (listing.seller.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const listingId = listing._id;

    // 1️⃣ Delete images
    await Image.deleteMany({ listing: listingId }).session(session);

    // 2️⃣ Remove from ALL carts
    await Panier.updateMany(
      { "items.product": listingId },
      { $pull: { items: { product: listingId } } }
    ).session(session);

    // 3️⃣ Remove from ALL favorites
    await Favorite.deleteMany({ listing: listingId }).session(session);

    // 4️⃣ Delete listing
    await listing.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Listing deleted with cascade" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("DELETE LISTING CASCADE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getImagesByListing = async (req, res) => {
  try {
    const images = await Image.find({ listing: req.params.id }).sort({ order: 1 });
    res.json({ success: true, images });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const incrementListingViews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ success: false });
    }

    // OPTIONAL: prevent seller from incrementing their own views
    if (req.user && listing.seller?.toString() === req.user.id) {
      return res.json({ success: true, views: listing.views });
    }

    listing.views += 1;
    await listing.save();

    res.json({
      success: true,
      views: listing.views,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


// Export par défaut pour les routes
export default {
  createListing,
  getListings,
  getListingById,
  compareListing,
  updateCoverImage,
  addListingImages,
  deleteListingImage,
  getSellerListings,
  updateListing,
  getImagesByListing,
  incrementListingViews,
  deleteListing
};