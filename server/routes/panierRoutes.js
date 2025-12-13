import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getMyPanier,
    addProduct,
    removeProduct,
} from "../controllers/panierController.js";

const router = express.Router();

router.get("/me", protect, getMyPanier);
router.post("/add", protect, addProduct);
router.delete("/product/:productId", protect, removeProduct);

export default router;
