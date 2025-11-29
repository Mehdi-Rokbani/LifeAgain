// routes/listingRoutes.js - SERVEUR Express
import express from "express";
import multer from "multer";
import listingController from "../controllers/listingController.js";

const router = express.Router();

// ---------- MULTER CONFIGURATION ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accepter seulement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// ---------- ROUTES API ----------

// CREATE LISTING
router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "photos", maxCount: 8 },
  ]),
  listingController.createListing
);

// GET ALL LISTINGS
router.get("/", listingController.getListings);

// GET LISTING BY ID
router.get("/:id", listingController.getListingById);

// COMPARE LISTING (ANALYSE INTELLIGENTE AVEC DEEPSEEK)
router.get("/:id/compare", listingController.compareListing);

// HEALTH CHECK - Pour tester la route
router.get("/health/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Listing routes working!",
    timestamp: new Date().toISOString()
  });
});

export default router;