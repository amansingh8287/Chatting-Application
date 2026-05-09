import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./socket/socket.js";
import { Message } from "./models/messagemodel.js";
import { io, getReceiverSocketId } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// 🔥 socket init
initSocket(server);

// 🔥 middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 🔥 CORS FIX
app.use(cors({
  origin: "https://chatting-application-4yur.vercel.app",
  credentials: true
}));

app.set("trust proxy", 1);

// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

setInterval(async () => {
  try {
    const now = new Date();

    console.log("Checking at:", now);

    const messages = await Message.find({
      isScheduled: true,
      scheduledTime: { $lte: new Date(now.getTime() + 5000) }, // 🔥 buffer fix
    });

    console.log("📦 Found:", messages.length);

    for (let msg of messages) {
      console.log("🚀 Sending:", msg.message);

      // update status
      msg.isScheduled = false;

      const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
      const senderSocketId = getReceiverSocketId(msg.senderId.toString());

      // delivered
      if (receiverSocketId) {
        msg.delivered = true;
      }

      // 🔥 SAVE ONCE ONLY
      await msg.save();

      // send to receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", msg);
      }

      // send to sender
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", msg);
      }

      // delivered tick
      if (receiverSocketId && senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: msg._id,
        });
      }
    }

  } catch (err) {
    console.log("❌ Scheduler error:", err);
  }
}, 5000);

// 🔥 start server properly
const startServer = async () => {
  try {
    await connectDB();
    console.log(" DB connected");

    server.listen(PORT, () => {
      console.log(" Server running on port", PORT);
    });

  } catch (error) {
    console.log("Error starting server:", error);
  }
};

startServer();