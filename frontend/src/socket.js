
import { io } from "socket.io-client";

let socket ;

export const connectSocket = (userId) => {

  socket = io("https://chatting-application-twg7.onrender.com", {
    query: { userId },
    withCredentials: true,
   
  });

  return socket;
};

export const getSocket = () => socket;