import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoriesroutes from "./routes/categoriesroutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import panierRoutes from "./routes/panierRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import commandeRoutes from "./routes/commandeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import favoriteRoutes from "./routes/favRoutes.js";

// Socket handler
import registerChatHandler from "./Socket/chatHandler.js";

dotenv.config();

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// HTTP + SOCKET.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

// -----------------------------
// 1️⃣ Attach io BEFORE routes!!
// -----------------------------
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Debug routes
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
});

// Static files
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------
// 2️⃣ API ROUTES (io available)
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoriesroutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes); // now req.io is defined inside controllers
app.use("/api/panier", panierRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoriteRoutes);



// -----------------------------
// 3️⃣ SOCKET.IO LOGIC
// -----------------------------
io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`📌 Joined room: ${conversationId}`);
    });

    socket.on("typing", ({ conversationId, userId }) => {
        socket.to(conversationId).emit("typing", { userId });
    });

    socket.on("stopTyping", ({ conversationId, userId }) => {
        socket.to(conversationId).emit("stopTyping", { userId });
    });

    registerChatHandler(io, socket);

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
    });
});

// -----------------------------
// 4️⃣ START SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
