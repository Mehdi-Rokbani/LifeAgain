import express from "express";
import {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
    searchListings
} from "../controllers/listingController.js";

const router = express.Router();

// Search/Filter (avant /:id pour éviter conflit)
router.get("/search", searchListings);

// CRUD basique
router.post("/", createListing);
router.get("/", getAllListings);
router.get("/:id", getListingById);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

export default router;