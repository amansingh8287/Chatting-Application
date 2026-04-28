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
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import { socket } from "../socket";

const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector(store => store.user);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {

      // ✅ sirf current chat ke messages hi add hon
      if (
        newMessage.senderId === selectedUser?._id ||
        newMessage.receiverId === selectedUser?._id
      ) {
        dispatch(addMessage(newMessage));
      }
    });

    return () => socket.off("newMessage");
  }, [selectedUser, dispatch]);
};

export default useGetRealTimeMessage;