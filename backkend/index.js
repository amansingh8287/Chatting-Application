import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./socket/socket.js";
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
  origin: true,
  credentials: true
}));

// IMPORTANT (preflight fix)
// app.options("*", cors());

// ROUTES
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

//  SERVER START
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});