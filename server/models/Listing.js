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
            min: [0, "Price cannot be negative"],
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
            required: true,
        },

        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },

        // 🔹 Optional attributes
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

        // 🔹 GeoJSON location (for nearby search)
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
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
