import express from "express";
import { addAddress, updatePfp, updateUser, uploadProfilePicture,getUserAddresses,deleteAddress } from "../controllers/UserController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/uploadPFP.js";
const router = express.Router();

router.post("/update-pfp", updatePfp);
router.put("/update", protect, updateUser);
router.post("/upload-picture", protect, upload.single("picture"), uploadProfilePicture);

router.post("/add", protect, addAddress);
router.get("/get", protect, getUserAddresses);
router.delete("/delete/:id", protect, deleteAddress);

export default router;
