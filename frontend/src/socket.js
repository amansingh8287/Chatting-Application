
import { io } from "socket.io-client";

const user = JSON.parse(localStorage.getItem("user"));
console.log("Socket user:", user);

export const socket = io(
  "https://chatting-application-twg7.onrender.com",
  {
    query: {
      userId: user?._id
    },
    withCredentials: true
  }
);