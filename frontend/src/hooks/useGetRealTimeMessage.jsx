import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setMessages } from "../redux/messageSlice";
import { setOnlineUsers } from "../redux/userSlice";
import { getSocket } from "../socket";

const useGetRealTimeMessage = () => {
  const [typingUser, setTypingUser] = useState(null);
  const dispatch = useDispatch();
  const { messages } = useSelector((store) => store.message);
  const { selectedUser } = useSelector((store) => store.user);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      setTypingUser(senderId);
    });

    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    // ✅ NEW MESSAGE
    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId === selectedUser?._id) {
        dispatch(addMessage(newMessage));
      }
    };

    socket.on("newMessage", handleNewMessage);

    // ✅ SEEN
    const handleSeen = ({ senderId }) => {
      dispatch(
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId?.toString() === senderId
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
            msg._id === messageId ? { ...msg, delivered: true } : msg,
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
