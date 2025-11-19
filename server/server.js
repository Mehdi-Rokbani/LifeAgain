import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import registerChatHandler from "./Socket/chatHandler.js";
import authRoutes from "./routes/authRoutes.js";
import panierRoutes from "./routes/panierRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";

// ⭐ Importe tous les modèles
import "./models/User.js";
import "./models/Category.js";
import "./models/Address.js";
import "./models/Listing.js";
import "./models/Panier.js";

// ⭐ Config
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ Crée l'app Express ICI
const app = express();

// ⭐ Middlewares
app.use(cors());
app.use(express.json());

// ⭐ Sert les fichiers statiques
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ⭐ Routes
app.use("/api/auth", authRoutes);
app.use("/api/panier", panierRoutes);
app.use("/api/listings", listingRoutes);

// ⭐ Socket.io
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", credentials: true },
});

registerChatHandler(io);

// ⭐ Démarrage du serveur
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});