import express from "express";
import {
    createConversation,
    getUserConversations,
    markAsRead
} from "../controllers/conversationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create a conversation
router.post("/", protect, createConversation);

// Get user conversations
router.get("/", protect, getUserConversations);

// Mark as read
router.post("/mark-read", protect, markAsRead);

export default router;
