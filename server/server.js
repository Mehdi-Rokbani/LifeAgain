import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import registerChatHandler from "./Socket/chatHandler.js";
import cors from "cors";
import axios from "axios";
import express from 'express';
import dotenv from 'dotenv';
import mongoose  from 'mongoose';
import iaRouter from "./routes/ia.js";

dotenv.config();

const app = express();
app.use(express.json());

// placez CORS avant les routes
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// affichage en console des requêtes
app.use((r, res, next) => {
  console.log(r.path, r.method);
  next();
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", credentials: true }
});

registerChatHandler(io); // 👈 important

// connection to db et démarrage DU SEUL serveur HTTP
mongoose.connect(process.env.URL)
  .then(() => {
    httpServer.listen(process.env.PORT || 4000, () =>
      console.log("Server running on", process.env.PORT || 4000)
    );
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Mongo connection error:', error);
  });


app.use('/', iaRouter);

app.get("/", (req, res) => {
  res.send("Backend LifeAgain connecté avec le frontend !");
});