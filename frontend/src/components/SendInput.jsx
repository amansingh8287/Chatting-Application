import React, { useState, useRef } from 'react';
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

  const typingTimeout = useRef(null); // 🔥 important

  const handleTyping = (value) => {
    setMessage(value);

    const socket = getSocket();
    if (!socket || !selectedUser?._id) return;

    // 🔥 typing emit
    socket.emit("typing", {
      receiverId: selectedUser._id
    });

    // 🔥 clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // 🔥 stopTyping after delay
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        receiverId: selectedUser._id
      });
    }, 1000);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser?._id}`,
        { message },
        { withCredentials: true }
      );

      dispatch(addMessage(res.data));

      // 🔥 stop typing on send
      const socket = getSocket();
      socket?.emit("stopTyping", {
        receiverId: selectedUser?._id
      });

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
          onChange={(e) => handleTyping(e.target.value)}
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