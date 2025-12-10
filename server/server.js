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

// Socket handler
import registerChatHandler from "./Socket/chatHandler.js";

// Models
import "./models/User.js";
import "./models/Category.js";
import "./models/Address.js";
import "./models/Listing.js";
import "./models/Panier.js";
import "./models/Commande.js";

dotenv.config();

// ---------- Fix ES Modules (__dirname) ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ------------------------------------------------

const app = express();
app.use(express.json());

// CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// Debug log
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // eyazagd branch feature

// ------------------- API ROUTES -------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoriesroutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/panier", panierRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/commandes", commandeRoutes);

// ---------------- SOCKET.IO SETUP -----------------
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

// Attach io to req for message notifications
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`📌 User joined room: ${conversationId}`);
    });

    registerChatHandler(io, socket);
});

// ---------------- START SERVER ------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
