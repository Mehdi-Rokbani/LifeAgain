import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoriesroutes from "./routes/categoriesroutes.js";

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import registerChatHandler from "./Socket/chatHandler.js";

import panierRoutes from "./routes/panierRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import commandeRoutes from "./routes/commandeRoutes.js";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";

// ⭐ Importe tous les modèles
import "./models/User.js";
import "./models/Category.js";
import "./models/Address.js";
import "./models/Listing.js";
import "./models/Panier.js";
import "./models/Commande.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


app.use(express.json());


app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// --------------------------------------------------
// Create server + socket.io
// --------------------------------------------------

// ⭐ Sert les fichiers statiques
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ⭐ Routes
app.use("/api/auth", authRoutes);
app.use("/api/panier", panierRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/commandes", commandeRoutes);
// ⭐ Socket.io

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", credentials: true },
});


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
registerChatHandler(io);

// ⭐ Démarrage du serveur

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});