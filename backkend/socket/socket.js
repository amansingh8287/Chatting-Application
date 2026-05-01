import { Server } from "socket.io";
import User from "../models/usermodel.js";

// userId -> socketId mapping
const userSocketMap = {};

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    // SAFETY CHECK
    if (!userId || userId === "undefined") {
      console.log("❌ Invalid userId");
      return;
    }

    console.log("✅ User connected:", userId);

    // ALWAYS STRING
    userSocketMap[userId.toString()] = socket.id;

    console.log("🔥 USER SOCKET MAP:", userSocketMap);

    // broadcast online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // =========================
    // TYPING EVENT
    // =========================
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId?.toString()];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          senderId: userId,
        });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId?.toString()];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", {
          senderId: userId,
        });
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", async () => {
      console.log("❌ User disconnected:", userId);

      if (!userId || userId === "undefined") return;

      //  REMOVE CORRECTLY
      delete userSocketMap[userId.toString()];

      try {
        //  SAFE DB UPDATE
        await User.findByIdAndUpdate(userId.toString(), {
          lastSeen: new Date(),
        });
      } catch (err) {
        console.log("LastSeen update error:", err.message);
      }

      // broadcast updated users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      console.log("UPDATED MAP:", userSocketMap);
    });
  });
};

//  HELPER FUNCTION (IMPORTANT FIX)
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId?.toString()];
};

// export io
export { io };