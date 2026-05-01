
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return;

  socket = io("https://chatting-application-twg7.onrender.com", {
    query: { userId },
    withCredentials: true
  });
};

export const getSocket = () => socket;