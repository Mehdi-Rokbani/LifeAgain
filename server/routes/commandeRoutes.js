import express from "express";
import { protect } from "../middleware/auth.js";
import {
    createCommandeFromPanier,
    getMyCommandes,
    getSellerCommandes,
    confirmCommandeItem,
    rejectCommandeItem,
} from "../controllers/commandeController.js";

const router = express.Router();

router.post("/checkout", protect, createCommandeFromPanier);
router.get("/me", protect, getMyCommandes);

// seller
router.get("/seller", protect, getSellerCommandes);
router.post(
    "/:commandeId/confirm/:listingId",
    protect,
    confirmCommandeItem
);

router.post(
    "/:commandeId/reject/:listingId",
    protect,
    rejectCommandeItem
);


export default router;
