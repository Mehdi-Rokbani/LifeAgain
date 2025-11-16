import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import registerChatHandler from "./Socket/chatHandler.js";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // ✅ import the function
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adressRoutes from "./routes/adressRoutes.js"
dotenv.config();
const app = express();
app.use(express.json());

// log requests
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,               // allow cookies / tokens if needed
}));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/address",adressRoutes);
// setup socket server
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", credentials: true },
});

registerChatHandler(io); // initialize sockets

// connect DB and start server
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
