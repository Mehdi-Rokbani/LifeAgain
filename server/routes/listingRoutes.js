// routes/listingRoutes.js - SERVER Express
import express from "express";
import multer from "multer";
//import listingController from "../controllers/listingController.js";
import { protect } from "../middleware/auth.js";

import { createListing,getListings,incrementListingViews,getListingById,getImagesByListing ,compareListing,updateCoverImage,addListingImages,deleteListingImage,getSellerListings,updateListing,deleteListing} from "../controllers/listingController.js";
const router = express.Router();

// --------------------------------------------------------------
// ⚙️ MULTER CONFIGURATION
// --------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
router.get("/seller/me", protect, getSellerListings);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
      cb(null, true);
    else
      cb(new Error("Seules les images sont autorisées!"), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// --------------------------------------------------------------
// 📌 LISTING ROUTES
// --------------------------------------------------------------


router.get("/listing/:id", protect, getImagesByListing);


// CREATE LISTING
router.post(
  "/",
  protect,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "photos", maxCount: 8 },
  ]),
  createListing
);

// GET ALL LISTINGS
router.get("/", getListings);

router.post("/:id/views", incrementListingViews);


// GET A SINGLE LISTING
router.get("/:id", getListingById);

// AI COMPARISON
router.get("/:id/compare", compareListing);

// --------------------------------------------------------------
// 📌 IMAGE MANAGEMENT ROUTES
// --------------------------------------------------------------

// UPDATE COVER IMAGE
router.put(
  "/:id/images/cover",
  upload.fields([{ name: "cover", maxCount: 1 }]),
  updateCoverImage
);

// ADD MORE IMAGES
router.post(
  "/:id/images",
  upload.fields([{ name: "photos", maxCount: 8 }]),
  addListingImages
);

// DELETE A SPECIFIC IMAGE
router.delete(
  "/:listingId/images/:imageId",
  deleteListingImage
);

// --------------------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------------------
router.get("/health/test", (req, res) => {
  res.json({
    success: true,
    message: "Listing routes working!",
    timestamp: new Date().toISOString(),
  });
});

export default router;
