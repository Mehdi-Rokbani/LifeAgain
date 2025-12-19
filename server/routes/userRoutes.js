import express from "express";
import {
    uploadProfileImage,
    updateUser,
    addAddress,
    getUserAddresses,
    deleteAddress,
} from "../controllers/UserController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/uploadPFP.js";

const router = express.Router();

// PROFILE
router.put(
    "/me/profile-image",
    protect,
    upload.single("image"),
    uploadProfileImage
);

router.put("/update", protect, updateUser);

// ADDRESSES
router.post("/add", protect, addAddress);
router.get("/get", protect, getUserAddresses);
router.delete("/delete/:id", protect, deleteAddress);

export default router;
