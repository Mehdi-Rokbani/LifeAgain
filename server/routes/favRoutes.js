import express from "express";
import {
    addFavorite,
    removeFavorite,
    getMyFavorites,
    isFavorited,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", addFavorite);
router.delete("/:listingId", removeFavorite);
router.get("/me", getMyFavorites);
router.get("/check/:listingId", isFavorited);

export default router;
