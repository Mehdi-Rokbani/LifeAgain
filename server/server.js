import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import registerChatHandler from "./Socket/chatHandler.js";

import express from 'express';
import dotenv from 'dotenv';
import mongoose  from 'mongoose';
const app = express()
app.use(express.json())
dotenv.config();
//affichage f console lel requests
app.use((r, res, next) => {
    console.log(r.path, r.method)
    next()
})

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", credentials: true }
});
httpServer.listen(process.env.PORT || 4000, () =>
    console.log("Server running on ", process.env.PORT || 4000)
);

registerChatHandler(io); // 👈 important

//connection to db
mongoose.connect(process.env.URL)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('server works')
        })
    })
    .catch((error) => {
        console.log(error)
    })

