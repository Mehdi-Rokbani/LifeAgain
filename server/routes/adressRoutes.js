import express from "express";
import { addAddress } from "../controllers/adressController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", protect, addAddress);

export default router;
