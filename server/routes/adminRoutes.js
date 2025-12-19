import express from "express";
import multer from "multer";

const storage = multer.diskStorage({
   destination: (req, file, cb) => cb(null, "uploads/"),
   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
import {
   adminGetAllUsers,
   adminGetUserById,
   adminDeleteUserCascade,
   adminAddSellerAddress,
   adminGetSellers,
   adminGetSellerAddresses,
   adminGetAllListings,
   adminUpdateListing,
   adminDeleteListingCascade,
   adminCreateListing,
   adminGetAllCommandes,
   adminUpdateCommandeStatus,
   adminGetListingById
} from "../controllers/adminController.js";

import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ===========================================================
   MIDDLEWARE
=========================================================== */
router.use(protect);
router.use(isAdmin);

/* ===========================================================
   USERS — ADMIN
=========================================================== */

// GET all users
router.get("/users", adminGetAllUsers);

// GET one user
router.get("/users/:id", adminGetUserById);

// DELETE user + cascade
router.delete("/users/:id", adminDeleteUserCascade);

/* ===========================================================
   LISTINGS — ADMIN
=========================================================== */

// GET all listings
router.get("/listings", adminGetAllListings);

// UPDATE listing
router.put("/listings/:id", adminUpdateListing);

// DELETE listing + cascade
router.delete("/listings/:id", adminDeleteListingCascade);

router.get("/sellers", adminGetSellers);
router.get("/sellers/:id/addresses", adminGetSellerAddresses);
router.post("/sellers/:id/addresses", adminAddSellerAddress);

// routes/admin.js
router.get("/listings/:id", adminGetListingById);



/* ===========================================================
   COMMANDES — ADMIN
=========================================================== */

// GET all commandes
router.get("/commandes", adminGetAllCommandes);

// UPDATE commande status
router.put("/commandes/:id/status", adminUpdateCommandeStatus);

/* ===========================================================
   HEALTH CHECK
=========================================================== */
router.get("/health", (req, res) => {
   res.json({
      success: true,
      message: "Admin routes operational",
      timestamp: new Date().toISOString(),
   });
});


router.post(
   "/listings",
   upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "photos", maxCount: 8 },
   ]),
   adminCreateListing
);

export default router;
