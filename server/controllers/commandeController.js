import Commande from "../models/Commande.js";
import Panier from "../models/Panier.js";
import Listing from "../models/Listing.js";
import mongoose from "mongoose";

/* ===========================================================
   CLIENT — CHECKOUT (SPLIT PER SELLER)
=========================================================== */
export const createCommandeFromPanier = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { billingDetails, paymentMethod } = req.body;

        const panier = await Panier.findOne({
            user: userId,
            status: "active",
        })
            .populate("items.product")
            .session(session);

        if (!panier || panier.items.length === 0) {
            return res.status(400).json({ message: "Panier is empty" });
        }

        const items = [];
        let totalPrice = 0;

        for (const item of panier.items) {
            const listing = item.product;

            if (!listing || listing.status !== "available") {
                throw new Error(`Product unavailable: ${listing?.title}`);
            }

            // ✅ SAFETY
            const quantity = Number(item.quantity || 1);
            const price = Number(listing.price);

            if (Number.isNaN(price) || Number.isNaN(quantity)) {
                throw new Error("Invalid price or quantity");
            }

            // 🔒 Lock listing
            listing.status = "in_transit";
            await listing.save({ session });

            items.push({
                listing: listing._id,
                quantity,
                price,
            });

            totalPrice += price * quantity;
        }

        const [commande] = await Commande.create(
            [
                {
                    buyer: userId,
                    items,
                    billingDetails,
                    totalPrice,
                    paymentMethod: paymentMethod || "cash",
                    status: "pending",
                },
            ],
            { session }
        );

        // 🧹 Empty panier
        panier.items = [];
        await panier.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            commande,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error("CHECKOUT ERROR:", err);
        res.status(400).json({ message: err.message });
    }
};

/* ===========================================================
   CLIENT — MY ORDERS
=========================================================== */
export const getMyCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find({ buyer: req.user.id })
            .populate({
                path: "items.listing",
                populate: {
                    path: "seller",
                    select: "username email",
                },
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, commandes });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};


/* ===========================================================
   SELLER — MY ORDERS
=========================================================== */
export const getSellerCommandes = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const commandes = await Commande.find({
            "items.listing": { $exists: true },
        })
            .populate({
                path: "items.listing",
                populate: {
                    path: "seller",
                    select: "username email",
                },
            })
            .populate("buyer", "username email")
            .sort({ createdAt: -1 });

        // 🔥 keep only items belonging to this seller
        const filtered = commandes
            .map((cmd) => {
                const sellerItems = cmd.items.filter(
                    (i) =>
                        i.listing &&
                        String(i.listing.seller._id) === sellerId
                );

                if (sellerItems.length === 0) return null;

                return {
                    ...cmd.toObject(),
                    items: sellerItems,
                };
            })
            .filter(Boolean);

        res.json({ success: true, commandes: filtered });
    } catch (err) {
        console.error("SELLER COMMANDES ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


/* ===========================================================
   SELLER — CONFIRM ORDER
=========================================================== */
export const confirmCommandeItem = async (req, res) => {
    const { commandeId, listingId } = req.params;
    const sellerId = req.user.id;

    const commande = await Commande.findById(commandeId)
        .populate("items.listing");

    if (!commande) {
        return res.status(404).json({ message: "Commande not found" });
    }

    const item = commande.items.find(
        i => String(i.listing._id) === listingId
    );

    if (!item || String(item.listing.seller) !== sellerId) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    // 1️⃣ Mark listing as sold
    item.listing.status = "sold";
    await item.listing.save();

    // 2️⃣ Recalculate order status
    const allSold = commande.items.every(
        i => i.listing.status === "sold"
    );

    if (allSold) {
        commande.status = "confirmed";
    }

    await commande.save();

    res.json({ success: true, commande });
};



/* ===========================================================
   SELLER — REJECT ORDER
=========================================================== */

export const rejectCommandeItem = async (req, res) => {
    const { commandeId, listingId } = req.params;
    const sellerId = req.user.id;

    const commande = await Commande.findById(commandeId)
        .populate("items.listing");

    if (!commande) {
        return res.status(404).json({ message: "Commande not found" });
    }

    const item = commande.items.find(
        i => String(i.listing._id) === listingId
    );

    if (!item || String(item.listing.seller) !== sellerId) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    // Restore listing
    item.listing.status = "available";
    await item.listing.save();

    // Check if all items are rejected / available
    const noneInTransit = commande.items.every(
        i => i.listing.status !== "in_transit"
    );

    if (noneInTransit) {
        commande.status = "cancelled";
    }

    await commande.save();

    res.json({ success: true, commande });
};
