import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./socket/socket.js";

dotenv.config();


const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

initSocket(server);

//  MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//  FINAL CORS FIX
app.use(cors({
  origin: [
    "https://chatting-application-eight.vercel.app",
    "https://chatting-application-dhkxxc4fm-workamansingh12-3760s-projects.vercel.app"
  ],
  credentials: true
}));

app.set("trust proxy", 1);

// ROUTES
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

//  SERVER START
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});