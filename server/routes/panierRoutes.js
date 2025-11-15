import express from "express";
import {
    createPanier,
    getPanierByUser,
    addProduct,
    removeProduct,
    updateQuantity
} from "../controllers/panierController.js";

const router = express.Router();

// Créer un panier
router.post("/", createPanier);

// Obtenir le panier d'un utilisateur
router.get("/user/:userId", getPanierByUser);

// Ajouter un produit au panier
router.post("/user/:userId/add", addProduct);

// Retirer un produit du panier
router.delete("/user/:userId/product/:productId", removeProduct);

// Modifier la quantité d'un produit
router.put("/user/:userId/product/:productId", updateQuantity);

export default router;