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

const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser, authUser } = useSelector((store) => store.user);

  useEffect(() => {
    // 🔥 NEW MESSAGE
    socket.on("newMessage", (newMessage) => {
      if (
        newMessage.senderId === selectedUser?._id ||
        newMessage.receiverId === selectedUser?._id
      ) {
        dispatch(addMessage(newMessage));
      }
    });

    // 🔥 SEEN UPDATE
    socket.on("messageSeen", ({ senderId }) => {
      dispatch(
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId.toString() === senderId ? { ...msg, seen: true } : msg,
          ),
        ),
      );
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

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
      socket.off("messageDeleted");
    };
  }, [selectedUser, authUser, dispatch]);
};

export default useGetRealTimeMessage;
