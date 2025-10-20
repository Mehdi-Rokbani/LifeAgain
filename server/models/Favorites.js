import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Prevent duplicates: one user can’t favorite the same listing twice
favoriteSchema.index({ user: 1, listing: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
