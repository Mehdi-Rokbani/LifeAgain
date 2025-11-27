import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import listingRoutes from "./routes/listingRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

// ---------- Fix ES Modules (__dirname) ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ------------------------------------------------

dotenv.config();

const app = express();

// JSON parser
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 🔥 Servir les images /uploads dans le navigateur
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes API
app.use("/api/listings", listingRoutes);

// Start server
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend lancé sur ${PORT}`));
});
