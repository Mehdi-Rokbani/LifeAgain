import Message from "../models/Message.js";
import Conversation from "../models/chat.js";

import jwt from "jsonwebtoken";

export default function registerChatHandler(io) {
    io.on("connection", async (socket) => {
        console.log("🟢 New socket connected:", socket.id);

        // Optional: verify token if you want authentication at socket level
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
            } catch (err) {
                console.log("❌ Invalid token");
                socket.disconnect();
                return;
            }
        }

        // JOIN a conversation room
        socket.on("joinConversation", ({ conversationId }) => {
            socket.join(conversationId);
            console.log(`👥 User ${socket.userId} joined ${conversationId}`);
        });

        // SEND a message
        socket.on("sendMessage", async ({ conversationId, content }) => {
            if (!socket.userId) return;

            const message = await Message.create({
                conversation: conversationId,
                sender: socket.userId,
                content,
            });

            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: content,
                lastSender: socket.userId,
                $addToSet: { unreadBy: { $ne: socket.userId } },
            });

            // Broadcast message to all users in the room
            io.to(conversationId).emit("newMessage", {
                conversationId,
                senderId: socket.userId,
                content,
                createdAt: message.createdAt,
            });
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });
}
