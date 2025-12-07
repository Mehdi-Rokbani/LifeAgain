import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, text } = req.body;

        if (!conversationId || !senderId || !text) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        if (text.length > 500) {
            return res.status(400).json({ message: "Message exceeds 500 characters." });
        }

        // Create the message using correct field names
        const message = await Message.create({
            conversation: conversationId,   // FIXED
            sender: senderId,
            content: text,                  // FIXED
        });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        conversation.lastMessage = text;
        conversation.lastSender = senderId;

        // Compute receiver
        const receiverId = conversation.participants.find(
            (id) => id.toString() !== senderId
        );

        // Add unread
        if (receiverId && !conversation.unreadBy.includes(receiverId)) {
            conversation.unreadBy.push(receiverId);
        }

        await conversation.save();

        // Emit socket
        req.io.to(conversationId).emit("newMessage", message);

        return res.status(201).json(message);

    } catch (err) {
        console.log("SEND MESSAGE ERROR:", err);
        return res.status(500).json({ message: "Server error sending message." });
    }
};

// -------------------------------------------------------



export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "username") // ✔ Only return username
            .sort({ createdAt: 1 });

        return res.json(messages);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
