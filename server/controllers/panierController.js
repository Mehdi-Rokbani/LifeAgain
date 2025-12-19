import Panier from "../models/Panier.js";
import Listing from "../models/Listing.js";

/**
 * INTERNAL
 * Always return active panier
 */
const getOrCreatePanier = async (userId) => {
    let panier = await Panier.findOne({ user: userId, status: "active" });

    if (!panier) {
        panier = await Panier.create({
            user: userId,
            items: [],
            status: "active",
        });
    }

    return panier;
};

// --------------------------------------------------
// GET MY PANIER (AUTO CLEAN + LIVE PRICE SYNC)
// GET /api/panier/me
// --------------------------------------------------
export const getMyPanier = async (req, res) => {
    try {
        let panier = await Panier.findOne({
            user: req.user.id,
            status: "active",
        }).populate({
            path: "items.product",
            populate: {
                path: "seller",
                select: "username",
            },
        });

        if (!panier) {
            return res.json({ items: [] });
        }

        let dirty = false;

        panier.items = panier.items.filter((item) => {
            if (!item.product) {
                dirty = true;
                return false;
            }

            if (item.product.status !== "available") {
                dirty = true;
                return false;
            }

            // 🔄 SYNC LIVE PRICE
            if (item.price !== item.product.price) {
                item.price = item.product.price;
                dirty = true;
            }

            return true;
        });

        if (dirty) {
            await panier.save();
        }

        res.json(panier);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --------------------------------------------------
// ADD PRODUCT
// POST /api/panier/add
// --------------------------------------------------
export const addProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Listing.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        if (product.status !== "available") {
            return res.status(400).json({
                message: "Ce produit n’est plus disponible",
            });
        }

        const panier = await getOrCreatePanier(req.user.id);

        const exists = panier.items.some(
            (item) => item.product.toString() === productId
        );

        if (exists) {
            return res.status(409).json({
                message: "Produit déjà dans le panier",
            });
        }

        panier.items.push({
            product: productId,
            quantity: 1,
            price: product.price, // initial price, will auto-sync later
        });

        await panier.save();

        const populated = await panier.populate({
            path: "items.product",
            populate: { path: "seller", select: "username" },
        });

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --------------------------------------------------
// REMOVE PRODUCT
// DELETE /api/panier/product/:productId
// --------------------------------------------------
export const removeProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const panier = await Panier.findOne({
            user: req.user.id,
            status: "active",
        });

        if (!panier) {
            return res.status(404).json({ message: "Panier introuvable" });
        }

        panier.items = panier.items.filter(
            (item) => item.product.toString() !== productId
        );

        await panier.save();

        const populated = await panier.populate({
            path: "items.product",
            populate: { path: "seller", select: "username" },
        });

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
