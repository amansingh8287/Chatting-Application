import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setMessages } from "../redux/messageSlice";
import { setOnlineUsers } from "../redux/userSlice";
import { getSocket } from "../socket";

const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    //  NEW MESSAGE
    const handleNewMessage = (newMessage) => {
      console.log(" RECEIVED:", newMessage);

      dispatch(addMessage(newMessage));
    };

    socket.on("newMessage", (newMessage) => {
      console.log(" RECEIVED:", newMessage);

      dispatch(addMessage(newMessage)); //  REMOVE FILTER
    });

    //  SEEN
    const handleSeen = ({ senderId }) => {
      const updated = messages.map((msg) =>
        msg.senderId?.toString() === senderId ? { ...msg, seen: true } : msg,
      );
      dispatch(setMessages(updated));
    };

    socket.on("messageSeen", handleSeen);

    // DELIVERED
    const handleDelivered = ({ messageId }) => {
      const updated = messages.map((msg) =>
        msg._id === messageId ? { ...msg, delivered: true } : msg,
      );
      dispatch(setMessages(updated));
    };

    socket.on("messageDelivered", handleDelivered);

    //  DELETE
    const handleDelete = (deletedMessage) => {
      const updated = messages.map((msg) =>
        msg._id === deletedMessage._id ? deletedMessage : msg,
      );
      dispatch(setMessages(updated));
    };

    socket.on("messageDeleted", handleDelete);

    //  ONLINE USERS
    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    //  CLEANUP
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleSeen);
      socket.off("messageDelivered", handleDelivered);
      socket.off("messageDeleted", handleDelete);
      socket.off("getOnlineUsers", handleOnlineUsers);
    };
  }, []);
};

export default useGetRealTimeMessage;
