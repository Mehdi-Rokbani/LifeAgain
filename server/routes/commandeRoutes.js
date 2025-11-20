import express from "express";
import {
    createCommandeFromPanier,
    getCommandesByUser,
    getCommandeById,
    updateCommandeStatus,
    getAllCommandes
} from "../controllers/commandeController.js";

const router = express.Router();

// Créer une commande depuis le panier
router.post("/", createCommandeFromPanier);

// Récupérer toutes les commandes (admin)
router.get("/", getAllCommandes);

// Récupérer les commandes d'un utilisateur
router.get("/user/:userId", getCommandesByUser);

// Récupérer une commande par ID
router.get("/:id", getCommandeById);

// Mettre à jour le statut d'une commande
router.put("/:id/status", updateCommandeStatus);

export default router;