import express from "express"

import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import userRoutes from "./routes/userRouter.js";

import {connectToSocket} from "./controllers/socketManager.js";   // to coonect the webrtc toa express 
import cors from "cors";

const app = express();         // to connect the express 
const server = createServer(app);   // to link the webRTC to a express 
const io = connectToSocket(server);    // to connect the WEBRTC 
const PORT = 8080;

app.use(cors());
app.use (express.json({limit : "40kb"}));
app.use(express.urlencoded({limit :"40kb" , extended : true }));   // check (used to parse the data ?)

app.use("/api/v1/user" , userRoutes);

app.get("/home" , (req,res) => {
    return res.json({"hello" : "world"});
})

const connectionDB = await mongoose.connect("mongodb+srv://aayushrathorexezovate_db_user:4FkkguCPa0YY7lNr@cluster0.gdo1nzh.mongodb.net/?appName=Cluster0")
console.log(`Connected to DB : ${connectionDB.connection.host}`);

server.listen( PORT , ()=> {
    console.log(`server is listening port ${PORT} `);
})
