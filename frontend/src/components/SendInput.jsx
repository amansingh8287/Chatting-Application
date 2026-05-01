// import React, {useState } from 'react'
// import { IoSend } from "react-icons/io5";
// import axios from "axios";
// import {useDispatch,useSelector} from "react-redux";
// import { setMessages } from '../redux/messageSlice';
// import { addMessage } from "../redux/messageSlice";
// import { BASE_URL } from '..';

// const SendInput = () => {
//     const [message, setMessage] = useState("");
//     const dispatch = useDispatch();
//     const {selectedUser} = useSelector(store=>store.user);
//     const {messages} = useSelector(store=>store.message);

//     const onSubmitHandler = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post(`${BASE_URL}/api/v1/message/send/${selectedUser?._id}`, {message}, {
//                 headers:{
//                     'Content-Type':'application/json'
//                 },
//                 withCredentials:true
//             });
//             // dispatch(setMessages([...messages, res?.data?.newMessage]))
//             dispatch(addMessage(res?.data?.newMessage));
//         } catch (error) {
//             console.log(error);
//         } 
//         setMessage("");
//     }
//     return (
//         <form onSubmit={onSubmitHandler} className='px-4 my-3'>
//             <div className='w-full relative'>
//                 <input
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     type="text"
//                     placeholder='Send a message...'
//                     className='border text-sm rounded-lg block w-full p-3 border-zinc-500 bg-gray-600 text-white'
//                 />
//                 <button type="submit" className='absolute flex inset-y-0 end-0 items-center pr-4'>
//                     <IoSend />
//                 </button>
//             </div>
//         </form>
//     )
// }

// export default SendInput

import React, { useState } from 'react';
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import { BASE_URL } from '..';
import { getSocket } from "../socket";

const SendInput = () => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const { selectedUser } = useSelector(store => store.user);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser?._id}`,
        { message },
        { withCredentials: true }
      );

      //  correct data
      dispatch(addMessage(res.data));

    } catch (error) {
      console.log(error);
    }

    setMessage("");
  };

  return (
    <form onSubmit={onSubmitHandler} className='p-4'>
      <div className='flex items-center gap-2 
        bg-white/30 backdrop-blur-md border border-white/20 
        rounded-xl px-3 py-2 shadow-lg'>

        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            //  SOCKET FIX
            const socket = getSocket();
            socket?.emit("typing", {
              receiverId: selectedUser?._id
            });
          }}
          type="text"
          placeholder='Type a message...'
          className='flex-1 text-sm md:text-base p-2 md:p-3 bg-transparent outline-none text-black'
        />

        <button className='bg-green-500 p-2 md:p-3 rounded-lg text-white'>
          <IoSend />
        </button>

      </div>
    </form>
  );
};

export default SendInput;