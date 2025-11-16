import express from "express";
import { register, login,getProfile } from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/auth.js";
import {verifyEmail} from "../controllers/verifyEmail.js"
const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/verify-email", verifyEmail);

export default router;
