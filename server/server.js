import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import registerChatHandler from "./Socket/chatHandler.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoriesroutes from "./routes/categoriesroutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// --------------------------------------------------
// CORS (merged both versions cleanly)
// --------------------------------------------------
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// --------------------------------------------------
// Debug logger (kept from your version)
// --------------------------------------------------
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// --------------------------------------------------
// Create server + socket.io
// --------------------------------------------------
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", credentials: true },
});

// Attach io to all requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --------------------------------------------------
// API ROUTES (merged both sets of routes)
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoriesroutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// --------------------------------------------------
// SOCKET.IO HANDLERS
// --------------------------------------------------
io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // User joins a conversation room
    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`📌 User joined room: ${conversationId}`);
    });

    registerChatHandler(io, socket);
});

// --------------------------------------------------
// START SERVER AFTER DB CONNECTS
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
