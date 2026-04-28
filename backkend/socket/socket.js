import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
        cors:{
            origin: "https://chatting-application-4yur-3gv84hfph.vercel.app",
            methods: ['GET', 'POST'],
            credentials: true
        },
    
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

const userSocketMap = {}; // {userId->socketId}


io.on('connection', (socket) => {

    console.log("User connected:", socket.id);

    // ✅ ADD THIS HERE
    socket.on("setup", (userId) => {
        userSocketMap[userId] = socket.id;

        // update online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);

        // remove user from map
        for (const key in userSocketMap) {
            if (userSocketMap[key] === socket.id) {
                delete userSocketMap[key];
            }
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export {app, io, server};


