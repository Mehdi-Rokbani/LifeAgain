import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        // 🔹 Core details
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: 2000,
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0.5, "Price must be at least 0.5 TND"],
        },

        condition: {
            type: String,
            enum: ["new", "used", "refurbished"],
            default: "used",
        },

        // 🔹 Relations
        images: [
            {
                type: String,
                trim: true
            },
        ],

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        },

        status: {
            type: String,
            enum: ["available", "sold", "archived"],
            default: "available",
        },

        views: {
            type: Number,
            default: 0,
        },

        favoritesCount: {
            type: Number,
            default: 0,
        },

        // 🔥 NOUVEAU: Adresse textuelle (ce que l'utilisateur tape)
        locationText: {
            type: String,
            trim: true,
        },

        // Coordonnées géographiques (pour les recherches géospatiales)
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [10.1815, 36.8065], // Tunis par défaut
            },
        },
    },
    { timestamps: true }
);

// Create index for geospatial queries
listingSchema.index({ location: "2dsphere" });

// Optional helper: increase view count
listingSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};

export default mongoose.model("Listing", listingSchema, "Listing");