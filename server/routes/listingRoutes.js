import express from "express";
import multer from "multer";
import {
  createListing,
  getListings,
  getListingById,
  compareWithNew
} from "../controllers/listingController.js";

const router = express.Router();

// --------- MULTER CONFIG ---------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // dossier uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // ex : 171234567-photo.jpg
  },
});

const upload = multer({ storage });
// ------------------------------------

// CREATE with images
router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "photos", maxCount: 8 }
  ]),
  createListing
);

// GET all listings
router.get("/", getListings);

// GET listing by ID
router.get("/:id", getListingById);

// 🔥 Nouvelle route de comparaison
router.get("/:id/compare", compareWithNew);

export default router;
