import mongoose from "mongoose";

import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Image from "../models/Image.js";
import Commande from "../models/Commande.js";
import Panier from "../models/Panier.js";
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
        const userId = req.params.id;

        // 1️⃣ Find listings owned by user
        const listings = await Listing.find({ seller: userId }).session(session);
        const listingIds = listings.map(l => l._id);

        // 2️⃣ Delete images (Image collection)
        await Image.deleteMany({ listing: { $in: listingIds } }).session(session);

        // 3️⃣ Delete listings
        await Listing.deleteMany({ seller: userId }).session(session);

        // 4️⃣ Delete commandes (buyer side)
        await Commande.deleteMany({ buyer: userId }).session(session);

        // 5️⃣ Delete panier
        await Panier.deleteMany({ user: userId }).session(session);

        // 6️⃣ Delete addresses
        await Address.deleteMany({ user: userId }).session(session);

        // 7️⃣ Delete user
        const deletedUser = await User.findByIdAndDelete(userId).session(session);

        if (!deletedUser) {
            throw new Error("User not found");
        }

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
        res.status(500).json({ success: false });
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
export const adminUpdateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false });
        }

        const allowedFields = [
            "title",
            "description",
            "price",
            "condition",
            "category",
            "status",
            "phone",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                listing[field] = req.body[field];
            }
        });

        await listing.save();

        res.json({ success: true, listing });
    } catch (err) {
        res.status(500).json({ success: false });
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
            .populate("buyer", "username email")
            .populate("items.listing")
            .sort({ createdAt: -1 });

        res.json({ success: true, commandes });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

/**
 * UPDATE COMMANDE STATUS (admin)
 */
export const adminUpdateCommandeStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const commande = await Commande.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("items.listing");

        if (!commande) {
            return res.status(404).json({ success: false });
        }

        res.json({
            success: true,
            commande,
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
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
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!mongoose.Types.ObjectId.isValid(seller)) {
            return res.status(400).json({ message: "Invalid seller ID" });
        }

        const coverFile = req.files?.cover?.[0];
        const photoFiles = req.files?.photos || [];

        if (!coverFile) {
            return res.status(400).json({ message: "Cover image required" });
        }

        const imageUrls = [
            `/uploads/${coverFile.filename}`,
            ...photoFiles.map(f => `/uploads/${f.filename}`)
        ];

        const listing = await Listing.create({
            title,
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

        // Save images in Image collection
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

        res.status(201).json({
            success: true,
            message: "Listing created by admin",
            listing,
        });

    } catch (err) {
        console.error("ADMIN CREATE LISTING ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

