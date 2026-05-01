// import { useEffect } from "react";
// import {useSelector, useDispatch} from "react-redux";
// import { setMessages } from "../redux/messageSlice";

// const useGetRealTimeMessage = () => {
//     const {socket} = useSelector(store=>store.socket);
//     const {messages} = useSelector(store=>store.message);
//     const dispatch = useDispatch();
//     useEffect(()=>{
//         socket?.on("newMessage", (newMessage)=>{
//             dispatch(setMessages([...messages, newMessage]));
//         });
//         return () => socket?.off("newMessage");
//     },[setMessages, messages]);
// };
// export default useGetRealTimeMessage;

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addMessage, setMessages } from "../redux/messageSlice";
import { socket } from "../socket";
import { useSelector } from "react-redux";
import { setOnlineUsers } from "../redux/userSlice";

const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser, authUser } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);

  useEffect(() => {
    // 🔥 NEW MESSAGE
    socket.on("newMessage", (newMessage) => {
      if (
        newMessage.senderId?.toString() === selectedUser?._id?.toString() ||
        newMessage.receiverId?.toString() === selectedUser?._id?.toString()
      ) {
        dispatch(addMessage(newMessage));
      }
      console.log("FRONTEND RECEIVED:", newMessage);
    });

    // 🔥 SEEN UPDATE
    socket.on("messageSeen", ({ senderId }) => {
      dispatch((dispatch, getState) => {
        const { messages } = getState().message;

        const updatedMessages = messages.map((msg) =>
          msg.senderId.toString() === senderId ? { ...msg, seen: true } : msg,
        );

        dispatch(setMessages(updatedMessages));
      });
    });

    socket.on("messageDelivered", ({ messageId }) => {
      dispatch((dispatch, getState) => {
        const { messages } = getState().message;

        const updated = messages.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg,
        );

        dispatch(setMessages(updated));
      });
    });

    socket.on("messageDeleted", (deletedMessage) => {
      dispatch(
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg,
          ),
        ),
      );
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
      socket.off("messageDeleted");
    };
  }, [selectedUser?._id, dispatch]);
};

export default useGetRealTimeMessage;
