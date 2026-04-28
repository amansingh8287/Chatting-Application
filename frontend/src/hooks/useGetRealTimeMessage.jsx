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
import { addMessage } from "../redux/messageSlice";
import { socket } from "../socket";

const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 🔥 duplicate listener hatao
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      dispatch(addMessage(newMessage)); // ✅ realtime add
    });

    return () => {
      socket.off("newMessage");
    };
  }, [dispatch]);
};

export default useGetRealTimeMessage;