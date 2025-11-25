import express from "express";
import { addAddress, updatePfp, updateUser } from "../controllers/UserController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/add-address", addAddress);
router.post("/update-pfp", updatePfp);
router.put("/update", protect,updateUser);

export default router;
