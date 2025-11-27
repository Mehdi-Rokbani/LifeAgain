// controllers/listingController.js
import Listing from "../models/Listing.js";
import Category from "../models/Category.js";
import Image from "../models/Image.js";
import mongoose from "mongoose";

// ========== CREATE LISTING ==========
export const createListing = async (req, res) => {
  try {
    const { title, category, description, price, phone, location } = req.body;

    console.log("📦 Données reçues:", { title, category, price, phone, location });
    console.log("📷 Fichiers reçus:", {
      cover: req.files?.cover?.[0]?.filename,
      photos: req.files?.photos?.map(f => f.filename)
    });

    if (!title || !category || !price) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // Category: accept id or name
    let categoryId;
    if (mongoose.Types.ObjectId.isValid(String(category))) {
      categoryId = category;
    } else {
      let cat = await Category.findOne({ name: category });
      if (!cat) cat = await Category.create({ name: category });
      categoryId = cat._id;
    }

    // Files via multer
    const coverFile = req.files?.cover?.[0]?.filename || null;
    const photoFiles = req.files?.photos ? req.files.photos.map(f => f.filename) : [];

    console.log("🖼️ Cover:", coverFile);
    console.log("🖼️ Photos:", photoFiles);

    // Create listing avec l'adresse textuelle
    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      phone,
      category: categoryId,
      locationText: location, // Stocker l'adresse telle quelle
      location: {
        type: "Point",
        coordinates: [10.1815, 36.8065] // Coordonnées par défaut (Tunis)
      }
    });

    console.log("✅ Listing créé:", listing._id);

    // Create images
    const imagesToInsert = [];
    if (coverFile) {
      imagesToInsert.push({ 
        listing: listing._id, 
        url: `/uploads/${coverFile}`, 
        isCover: true,
        order: 0
      });
    }
    
    photoFiles.forEach((filename, index) => {
      imagesToInsert.push({ 
        listing: listing._id, 
        url: `/uploads/${filename}`, 
        isCover: false,
        order: index + 1
      });
    });

    console.log("🖼️ Images à insérer:", imagesToInsert.length);

    if (imagesToInsert.length > 0) {
      const inserted = await Image.insertMany(imagesToInsert);
      console.log("✅ Images insérées:", inserted.length);
      
      const imageIds = inserted.map(i => i._id);
      listing.images = imageIds;
      await listing.save();
      console.log("✅ Listing mis à jour avec images");
    }

    const result = await Listing.findById(listing._id)
      .populate("images")
      .populate("category")
      .lean();
      
    console.log("✅ Résultat final:", {
      id: result._id,
      imagesCount: result.images?.length,
      location: result.locationText
    });
      
    return res.json({ message: "Annonce créée", listing: result });
  } catch (err) {
    console.error("❌ createListing error:", err);
    res.status(500).json({ 
      error: "Erreur création", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ========== GET ALL LISTINGS ==========
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .populate("images")
      .populate("category")
      .lean();
    
    console.log(`✅ ${listings.length} annonces récupérées`);
    res.json(listings);
  } catch (err) {
    console.error("❌ getListings error:", err);
    res.status(500).json({ error: "Erreur get listings" });
  }
};

// ========== GET LISTING BY ID ==========
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    
    const listing = await Listing.findById(id)
      .populate("images")
      .populate("category")
      .lean();
    
    if (!listing) {
      return res.status(404).json({ error: "Annonce introuvable" });
    }
    
    console.log(`✅ Annonce récupérée: ${listing.title}`);
    res.json(listing);
  } catch (err) {
    console.error("❌ getListingById error:", err);
    res.status(500).json({ error: "Erreur get by id" });
  }
};

// Nouvelle fonction : Comparer un produit avec son état neuf
export const compareWithNew = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le listing
    const listing = await Listing.findById(id)
      .populate("category")
      .lean();
    
    if (!listing) {
      return res.status(404).json({ error: "Annonce introuvable" });
    }

    // Appel à l'API Claude (ou autre IA)
    const comparisonPrompt = `
Tu es un expert en produits d'occasion. Compare ce produit d'occasion avec son équivalent neuf.

Produit: ${listing.title}
Catégorie: ${listing.category?.name || "Non spécifié"}
Description: ${listing.description}
Prix actuel: ${listing.price} TND
État: ${listing.condition}

Fournis une comparaison détaillée au format JSON avec:
{
  "newProduct": {
    "name": "Nom du produit neuf",
    "price": prix_neuf_estimé,
    "specs": ["spec1", "spec2", ...],
    "material": "matériau",
    "warranty": "garantie",
    "originCountry": "pays"
  },
  "usedProduct": {
    "name": "${listing.title}",
    "price": ${listing.price},
    "condition": "${listing.condition}",
    "specs": ["spec1", "spec2", ...],
    "material": "matériau estimé",
    "warranty": "pas de garantie",
    "originCountry": "estimé"
  },
  "comparison": {
    "priceAdvantage": "pourcentage d'économie",
    "conditionAnalysis": "analyse de l'état",
    "valueForMoney": "rapport qualité-prix",
    "recommendation": "recommandation d'achat"
  }
}
`;

    // Appel API (exemple avec fetch vers une API d'IA)
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: comparisonPrompt
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const comparisonText = aiData.content[0].text;
    
    // Parser la réponse JSON
    const comparison = JSON.parse(comparisonText);

    res.json({
      listing,
      comparison,
      generatedAt: new Date()
    });

  } catch (err) {
    console.error("❌ compareWithNew error:", err);
    res.status(500).json({ 
      error: "Erreur lors de la comparaison", 
      details: err.message 
    });
  }
};