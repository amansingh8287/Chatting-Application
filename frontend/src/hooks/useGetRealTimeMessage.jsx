import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setMessages } from "../redux/messageSlice";
import { setOnlineUsers } from "../redux/userSlice";
import { getSocket } from "../socket";
import axios from "axios";
import { BASE_URL } from "../index";

const useGetRealTimeMessage = () => {
  const [typingUser, setTypingUser] = useState(null);
  const dispatch = useDispatch();
  const { messages } = useSelector((store) => store.message);
  const { selectedUser } = useSelector((store) => store.user);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      console.log(" typing received:", senderId);

      if(senderId === selectedUser?._id) {
        setTypingUser(senderId);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        setTypingUser(null);
      }
    });

    // ✅ NEW MESSAGE
    const handleNewMessage = async (newMessage) => {
      dispatch(addMessage(newMessage));

      // 🔥 mark seen instantly when message arrives
      if (newMessage.senderId === selectedUser?._id) {
        await axios.put(
          `${BASE_URL}/api/v1/message/seen/${selectedUser._id}`,
          {},
          { withCredentials: true },
        );
      }
    };

    socket.on("newMessage", handleNewMessage);

    // ✅ SEEN
    const handleSeen = ({ messageIds }) => {
      dispatch(
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg._id?.toString())
              ? { ...msg, seen: true }
              : msg,
          ),
        ),
      );
    };

    socket.on("messageSeen", handleSeen);

    // ✅ DELIVERED
    const handleDelivered = ({ messageId }) => {
      dispatch(
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id?.toString() === messageId?.toString()
              ? { ...msg, delivered: true }
              : msg,
          ),
        ),
      );
    };

    socket.on("messageDelivered", handleDelivered);

    // ✅ DELETE
    const handleDelete = (deletedMessage) => {
      dispatch(
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg,
          ),
        ),
      );
    };

    socket.on("messageDeleted", handleDelete);

    // ✅ ONLINE USERS (alag slice hai)
    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users)); // ❗ FIX
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    // ✅ CLEANUP
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleSeen);
      socket.off("messageDelivered", handleDelivered);
      socket.off("messageDeleted", handleDelete);
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);
  return { typingUser };
};

export default useGetRealTimeMessage;
