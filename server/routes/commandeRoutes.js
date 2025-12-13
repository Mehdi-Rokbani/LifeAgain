import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import {
    createCommandeFromPanier,
    getCommandesByUser,
    getCommandeById,
    updateCommandeStatus,
    getAllCommandes,
    cancelCommande
} from "../controllers/commandeController.js";

const router = express.Router();

// -----------------------------------
// CREATE ORDER (client)
// -----------------------------------
router.post("/", protect, createCommandeFromPanier);

// -----------------------------------
// GET USER ORDERS (client)
// ⚠️ userId comes from token, NOT param
// -----------------------------------
router.get("/user", protect, getCommandesByUser);

// -----------------------------------
// GET ONE ORDER (client or seller)
// -----------------------------------
router.get("/:id", protect, getCommandeById);

// -----------------------------------
// UPDATE STATUS (seller / admin)
// -----------------------------------
router.put("/:id/status", protect, isAdmin, updateCommandeStatus);

// -----------------------------------
// CANCEL ORDER (client)
// -----------------------------------
router.put("/:id/cancel", protect, cancelCommande);

// -----------------------------------
// GET ALL ORDERS (admin only)
// -----------------------------------
router.get("/", protect, isAdmin, getAllCommandes);

export default router;
