
import { io } from "socket.io-client";

export const socket = io(
  "https://chatting-application-twg7.onrender.com",
  {
    
    withCredentials: true
  }
);