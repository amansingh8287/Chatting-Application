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
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import { addMessage } from "../redux/messageSlice";
import { socket } from "../socket";

const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector(store => store.user);

  useEffect(() => {

    socket.off("messageSeen");

    socket.on("messageSeen", () => {
      dispatch(setMessages(prev =>
        prev.map(msg =>
          msg.senderId === authUser._id
            ? { ...msg, seen: true }
            : msg
        )
      ));
    });

    return () => socket.off("messageSeen");

  }, [authUser]);
};

export default useGetRealTimeMessage;