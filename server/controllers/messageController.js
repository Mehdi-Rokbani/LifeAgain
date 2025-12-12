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

        // CREATE MESSAGE
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            content: text
        });

        // FETCH CONVERSATION
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // UPDATE LAST MESSAGE FIELDS
        conversation.lastMessage = text;
        conversation.lastSender = senderId;

        // MARK RECEIVER AS UNREAD
        const receiverId = conversation.participants.find(
            (id) => id.toString() !== senderId
        );

        if (receiverId && !conversation.unreadBy.includes(receiverId)) {
            conversation.unreadBy.push(receiverId);
        }

        await conversation.save();

        // -----------------------------
        // 🔥 REAL-TIME CHAT WINDOW UPDATE
        // -----------------------------
        req.io.to(conversationId).emit("newMessage", {
            ...message.toObject(),
            sender: senderId
        });

        // -----------------------------
        // 🔥 REAL-TIME SIDEBAR UPDATE
        // -----------------------------
        req.io.emit("conversationUpdated", {
            conversationId: conversation._id.toString(),
            lastMessage: text,
            lastSender: senderId,
            updatedAt: conversation.updatedAt,
            unread: true
        });

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
