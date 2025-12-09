import express from "express";
import mongoose from "mongoose"; // ← AJOUTE
import {
    createPanier,
    getPanierByUser,
    addProduct,
    removeProduct,
    updateQuantity
} from "../controllers/panierController.js";
import Panier from "../models/Panier.js"; // ← AJOUTE

const router = express.Router();

router.post("/", createPanier);
router.get("/user/:userId", getPanierByUser);
router.post("/user/:userId/add", addProduct);
router.delete("/user/:userId/product/:productId", removeProduct);
router.put("/user/:userId/product/:productId", updateQuantity);

// ⭐ AJOUTE CETTE ROUTE DE TEST
router.get("/user/:userId/add-test/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;
        
        console.log("🔵 Ajout produit:", productId, "pour user:", userId);
        
        let panier = await Panier.findOne({ user: userId, status: "active" });
        if (!panier) {
            panier = await Panier.create({ user: userId, items: [] });
        }

        const Listing = mongoose.model("Listing");
        const product = await Listing.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        const existingItem = panier.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            panier.items.push({
                product: productId,
                quantity: 1,
                price: product.price,
            });
        }

        await panier.save();
        
        const populated = await Panier.findById(panier._id).populate('items.product');
        
        console.log("✅ Produit ajouté");
        res.json(populated);
    } catch (err) {
        console.error("❌ Erreur:", err);
        res.status(500).json({ message: err.message });
    }
});

export default router;