import Favorite from "../models/Favorites.js";
import Listing from "../models/Listing.js";

/* ===============================
   ADD FAVORITE
================================ */


export const addFavorite = async (req, res) => {
    try {
        const { listingId } = req.body;
        const userId = req.user.id;

        if (!listingId) {
            return res.status(400).json({ message: "Listing ID required" });
        }

        const favorite = await Favorite.create({
            user: userId,
            listing: listingId,
        });

        // 🔥 increment counter
        await Listing.findByIdAndUpdate(listingId, {
            $inc: { favoritesCount: 1 },
        });

        // 🔥 populate listing so frontend NEVER breaks
        await favorite.populate({
            path: "listing",
            populate: [
                { path: "category", select: "name" },
                { path: "seller", select: "username" },
            ],
        });

        res.status(201).json({
            success: true,
            favorite,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Already favorited" });
        }
        res.status(500).json({ message: "Server error" });
    }
};


/* ===============================
   REMOVE FAVORITE
================================ */
export const removeFavorite = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user.id;

        const deleted = await Favorite.findOneAndDelete({
            user: userId,
            listing: listingId,
        });

        if (deleted) {
            await Listing.findByIdAndUpdate(listingId, {
                $inc: { favoritesCount: -1 },
            });
        }

        res.json({ success: true });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
   GET MY FAVORITES
================================ */
export const getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id })
            .populate({
                path: "listing",
                populate: [
                    { path: "category", select: "name" },
                    { path: "seller", select: "username" },
                ],
            })
            .sort({ addedAt: -1 });

        res.json({ success: true, favorites });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
   CHECK IF FAVORITED
================================ */
export const isFavorited = async (req, res) => {
    try {
        const exists = await Favorite.exists({
            user: req.user.id,
            listing: req.params.listingId,
        });

        res.json({ favorited: !!exists });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
};
