import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import registerChatHandler from "./Socket/chatHandler.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // ✅ import the function

import authRoutes from "./routes/authRoutes.js";
import categoriesroutes from "./routes/categoriesroutes.js";
dotenv.config();
const app = express();
app.use(express.json());

// enable CORS for development (allow requests from Vite/dev server)
app.use(cors({ origin: true, credentials: true }));

// log requests
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesroutes);

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
