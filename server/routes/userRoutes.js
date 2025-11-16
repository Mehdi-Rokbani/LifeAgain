import express from "express";
import { getUserById, deleteUser, updateUser, getAllUsers,uploadProfilePicture,skipPicture } from "../controllers/UserController.js";
import { protect, isAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
const router = express.Router();

router.get("/", protect, isAdmin, getAllUsers);


router.get("/:id", protect, getUserById);


router.put("/update", protect, updateUser);


router.delete("/:id", protect, isAdmin, deleteUser);

router.post("/upload-picture", protect, upload.single("image"), uploadProfilePicture);
router.post("/skip-picture", protect, skipPicture);


export default router;
