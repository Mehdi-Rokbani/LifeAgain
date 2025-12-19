import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 100,
        },

        // 🔒 Normalized title for uniqueness checks
        titleNormalized: {
            type: String,
            required: true,
            trim: true,
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

        images: [
            {
                type: String,
                trim: true,
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
            required: true,
        },

        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
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

        locationText: {
            type: String,
            trim: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [10.1815, 36.8065],
            },
        },
    },
    { timestamps: true }
);

// 🔒 UNIQUE per seller + title
listingSchema.index(
    { seller: 1, titleNormalized: 1 },
    { unique: true }
);

// 🌍 Geospatial
listingSchema.index({ location: "2dsphere" });

export default mongoose.model("Listing", listingSchema, "Listing");
