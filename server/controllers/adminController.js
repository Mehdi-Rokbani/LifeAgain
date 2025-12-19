import mongoose from "mongoose";

import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Image from "../models/Image.js";
import Commande from "../models/Commande.js";
import Panier from "../models/Panier.js";
import Favorite from "../models/Favorites.js";

import Address from "../models/Address.js";


/* ===========================================================
   USERS — ADMIN
=========================================================== */

/**
 * GET ALL USERS (admin)
 */
export const adminGetAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("addresses")
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (err) {
        console.error("ADMIN GET USERS ERROR:", err);
        res.status(500).json({ success: false });
    }
};

/**
 * GET SINGLE USER (admin)
 */
export const adminGetUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("addresses")
            .populate("favorites");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

/**
 * DELETE USER — HARD CASCADE (admin)
 * Deletes EVERYTHING related to user:
 * - Listings
 * - Images
 * - Commandes
 * - Panier
 * - Addresses
 * - User
 */

export const adminDeleteUserCascade = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const targetUserId = req.params.id;
        const adminId = req.user.id;

        // 1️⃣ Prevent self delete
        if (targetUserId === adminId) {
            return res.status(403).json({
                message: "You cannot delete your own admin account",
            });
        }

        const targetUser = await User.findById(targetUserId).session(session);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ Prevent deleting other admins
        if (targetUser.role === "admin") {
            return res.status(403).json({
                message: "You cannot delete another admin",
            });
        }

        // 3️⃣ Cascade delete
        const listings = await Listing.find({ seller: targetUserId }).session(session);
        const listingIds = listings.map(l => l._id);

        await Panier.updateMany(
            {},
            { $pull: { items: { product: { $in: listingIds } } } },
            { session }
        );

        // 3️⃣ REMOVE LISTINGS FROM FAVORITES
        await Favorite.deleteMany(
            { listing: { $in: listingIds } },
            { session }
        );

        await Image.deleteMany({ listing: { $in: listingIds } }).session(session);
        await Listing.deleteMany({ seller: targetUserId }).session(session);
        await Commande.deleteMany({ buyer: targetUserId }).session(session);
        await Panier.deleteMany({ user: targetUserId }).session(session);
        await Address.deleteMany({ user: targetUserId }).session(session);

        await User.findByIdAndDelete(targetUserId).session(session);

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: "User and all related data deleted permanently",
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("ADMIN DELETE USER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};



/* ===========================================================
   LISTINGS — ADMIN
=========================================================== */

/**
 * GET ALL LISTINGS (admin)
 */
export const adminGetAllListings = async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate("category seller")
            .sort({ createdAt: -1 });

        res.json({ success: true, listings });
    } catch (err) {
        console.error("ADMIN GET LISTINGS ERROR:", err);
        res.status(500).json({ success: false });
    }
};

/**
 * UPDATE LISTING (admin)
 * Admin can update ANY listing (even sold)
 */
// controllers/adminController.js


const normalizeTitle = (title) =>
    title.trim().toLowerCase().replace(/\s+/g, " ");

export const adminUpdateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found",
            });
        }

        const {
            title,
            description,
            price,
            condition,
            category,
            status,
        } = req.body;


        if (listing.status === "sold") {
            return res.status(400).json({
                success: false,
                message: "Sold listings cannot be edited",
            });
        }


        // ================= TITLE (UNIQUE PER SELLER) =================
        if (title && title !== listing.title) {
            const titleNormalized = normalizeTitle(title);

            const exists = await Listing.findOne({
                _id: { $ne: listing._id },   // exclude current listing
                seller: listing.seller,
                titleNormalized,
            });

            if (exists) {
                return res.status(409).json({
                    success: false,
                    message: "This seller already has a listing with this title",
                });
            }

            listing.title = title;
            listing.titleNormalized = titleNormalized;
        }

        // ================= OTHER FIELDS =================
        if (description !== undefined) listing.description = description;
        if (price !== undefined) listing.price = price;
        if (condition !== undefined) listing.condition = condition;
        if (category !== undefined) listing.category = category;
        if (status !== undefined) listing.status = status;

        await listing.save();

        res.json({
            success: true,
            message: "Listing updated successfully",
            listing,
        });

    } catch (err) {
        console.error("ADMIN UPDATE LISTING ERROR:", err);

        // extra safety for unique index
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate listing title for this seller",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


/**
 * DELETE LISTING — HARD CASCADE (admin)
 * - Deletes images
 * - Deletes listing
 * - Keeps commandes history intact
 */
export const adminDeleteListingCascade = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const listingId = req.params.id;

        await Image.deleteMany({ listing: listingId }).session(session);
        await Listing.findByIdAndDelete(listingId).session(session);

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: "Listing deleted permanently",
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false });
    }
};

/* ===========================================================
   COMMANDES — ADMIN
=========================================================== */

/**
 * GET ALL COMMANDES (admin)
 */

export const adminGetAllCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find()
            .populate("buyer", "email username")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            commandes,
        });
    } catch (err) {
        console.error("ADMIN GET COMMANDE ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

/**
 * UPDATE COMMANDE STATUS (admin)
 */


/**
 * PUT /api/admin/commandes/:id/status
 */
export const adminUpdateCommandeStatus = async (req, res) => {
    const { status } = req.body;

    if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const commande = await Commande.findById(req.params.id)
        .populate("items.listing");

    if (!commande) {
        return res.status(404).json({ message: "Commande not found" });
    }

    // 🔒 Lock final states
    if (["completed", "cancelled"].includes(commande.status)) {
        return res
            .status(400)
            .json({ message: "Commande already finalized" });
    }

    // 🔴 ADMIN CANCEL LOGIC
    if (status === "cancelled") {
        for (const item of commande.items) {
            const listing = item.listing;

            if (listing) {
                listing.status = "available";
                await listing.save();
            }
        }
    }

    commande.status = status;
    await commande.save();

    res.json({
        success: true,
        status: commande.status,
    });
};


export const adminCreateListing = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition,
            seller,
            address,
        } = req.body;

        if (!title || !description || !price || !category || !seller || !address) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(seller)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller",
            });
        }

        const coverFile = req.files?.cover?.[0];
        const photoFiles = req.files?.photos || [];

        if (!coverFile) {
            return res.status(400).json({
                success: false,
                message: "Cover image is required",
            });
        }

        const imageUrls = [
            `/uploads/${coverFile.filename}`,
            ...photoFiles.map(f => `/uploads/${f.filename}`),
        ];

        const listing = await Listing.create({
            title,
            titleNormalized: title.trim().toLowerCase(), // ✅ ENSURE THIS IS SET
            description,
            price,
            category,
            condition: condition || "used",
            seller,
            address,
            images: imageUrls,
            locationText: "Tunisie",
            location: {
                type: "Point",
                coordinates: [10.1815, 36.8065],
            },
        });

        // Save images
        const images = [];

        images.push({
            listing: listing._id,
            url: imageUrls[0],
            isCover: true,
            order: 0,
        });

        photoFiles.forEach((file, index) => {
            images.push({
                listing: listing._id,
                url: `/uploads/${file.filename}`,
                isCover: false,
                order: index + 1,
            });
        });

        await Image.insertMany(images);

        return res.status(201).json({
            success: true,
            message: "Listing created successfully",
            listing,
        });

    } catch (err) {
        console.error("ADMIN CREATE LISTING ERROR:", err);

        // ✅ DUPLICATE TITLE (seller already posted same product)
        if (
            err.code === 11000 ||
            err.message?.includes("titleNormalized")
        ) {
            return res.status(409).json({
                success: false,
                message: "This seller already posted a listing with the same title",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unexpected server error while creating listing",
        });
    }
};

export const adminGetSellers = async (req, res) => {
    try {
        const sellers = await User.find({
            role: "seller"
        }).select("_id username email");

        res.json({ success: true, sellers });
    } catch {
        res.status(500).json({ success: false });
    }
};
export const adminGetSellerAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.params.id });
        res.json({ success: true, addresses });
    } catch {
        res.status(500).json({ success: false });
    }
};
export const adminAddSellerAddress = async (req, res) => {
    try {
        const address = await Address.create({
            user: req.params.id,
            ...req.body,
        });

        res.status(201).json({ success: true, address });
    } catch {
        res.status(500).json({ success: false });
    }
};


// controllers/adminController.js
export const adminGetListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate("category", "name")
            .populate("seller", "username email");

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found",
            });
        }

        res.json({
            success: true,
            listing,
        });
    } catch (err) {
        console.error("ADMIN GET LISTING ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const adminGetCommandeById = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id)
            .populate("buyer", "email")
            .populate({
                path: "items.listing",
                populate: {
                    path: "seller",
                    select: "username email",
                },
            });

        if (!commande) {
            return res.status(404).json({ message: "Commande not found" });
        }

        res.json({ success: true, commande });
    } catch (err) {
        console.error("ADMIN COMMANDE DETAILS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
