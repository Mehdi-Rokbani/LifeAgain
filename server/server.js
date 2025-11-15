import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import registerChatHandler from "./Socket/chatHandler.js";
import authRoutes from "./routes/authRoutes.js";
import panierRoutes from "./routes/panierRoutes.js";
import cors from "cors"
dotenv.config();
const app = express();


app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/panier", panierRoutes);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", credentials: true },
});

registerChatHandler(io);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
