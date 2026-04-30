
import { io } from "socket.io-client";

export const socket = io(
  "https://chatting-application-twg7.onrender.com",
  {
    query: {
      userId: authUser._id
    },
    withCredentials: true
  }
);