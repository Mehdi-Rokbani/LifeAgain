import express from "express";
import { register, login, getProfile, sendVerification, verifyEmail } from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/send-verification", sendVerification);
router.post("/verify-email", verifyEmail);
export default router;
