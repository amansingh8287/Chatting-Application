
import { io } from "socket.io-client";

const user = JSON.parse(localStorage.getItem("user"));

export const socket = io(
  "https://chatting-application-twg7.onrender.com",
  {
    query: {
      userId: authUser._id
    },
    withCredentials: true
  }
);