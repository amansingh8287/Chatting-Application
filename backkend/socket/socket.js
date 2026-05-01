import { Server } from "socket.io";
import User from "../models/usermodel.js";

//  userId -> socketId mapping
const userSocketMap = {};

let io;

//  init function (index.js se call hoga)
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://chatting-application-eight.vercel.app"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    //  IMPORTANT: userId handshake se lo
    const userId = socket.handshake.query.userId;

    console.log("User connected:", userId);

    //  user ko map karo
    if (userId) {
      userSocketMap[userId.toString()] = socket.id;
    }

    //  online users broadcast
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // =========================
    //  TYPING EVENT
    // =========================
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          senderId: userId,
        });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", {
          senderId: userId,
        });
      }
    });

    // =========================
    //  DISCONNECT
    // =========================
    socket.on("disconnect", async () => {
      console.log("User disconnected:", userId);

     if (!userId || userId === "undefined") return;
      //  remove from online users
      delete userSocketMap[userId];

      //  update last seen
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });

      // 🔥 broadcast updated list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

//  helper function (controllers me use hoga)
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId?.toString()];
};

// io export (controllers ke liye)
export { io };
