import React, { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import { BASE_URL } from "..";
import { getSocket } from "../socket";

const SendInput = () => {
  const [message, setMessage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);
  const { authUser } = useSelector((store) => store.user);

  const typingTimeout = useRef(null); // important

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = "en-US"; //  Hindi ke liye: "hi-IN"
  }

  const startListening = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setMessage((prev) => prev + " " + transcript);

      //  typing emit
      const socket = getSocket();
      if (socket && selectedUser?._id) {
        socket.emit("typing", {
          receiverId: selectedUser._id,
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (err) => {
      console.log("🎤 ERROR TYPE:", event.error);

      if (event.error === "not-allowed") {
        alert("Microphone permission denied ❌");
      }

      if (event.error === "no-speech") {
        alert("No speech detected 😐");
      }

      if (event.error === "audio-capture") {
        alert("Mic not found 🎤❌");
      }

      if (event.error === "network") {
        alert("Internet issue 🌐");
      }
      setIsListening(false);
    };
  };

  const handleTyping = (value) => {
    setMessage(value);

    const socket = getSocket();
    if (!socket || !selectedUser?._id) return;

    // typing emit
    if (socket && selectedUser?._id) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
      });
    }

    // clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    //  stopTyping after delay
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        receiverId: selectedUser._id,
      });
    }, 1500);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (scheduleTime && new Date(scheduleTime) < new Date()) {
      alert("Please select future time");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser?._id}`,
        {
          message,
          scheduledTime: scheduleTime ? new Date(scheduleTime) : null,
        },

        { withCredentials: true },
      );

      dispatch(addMessage(res.data));

      //  stop typing on send
      const socket = getSocket();

      if (socket && selectedUser?._id) {
        socket.emit("stopTyping", {
          receiverId: selectedUser._id,
        });
      }
    } catch (error) {
      console.log(error);
    }

    setMessage("");
    setScheduleTime("");
  };

  return (
    <form onSubmit={onSubmitHandler} className="p-4">
      <input
        type="datetime-local"
        value={scheduleTime}
        onChange={(e) => setScheduleTime(e.target.value)}
        className="border p-2 rounded w-full text-black"
      />

      <div
        className="flex items-center gap-2 
        bg-white/30 backdrop-blur-md border border-white/20 
        rounded-xl px-3 py-2 shadow-lg"
      >
        <button
          type="button"
          onClick={startListening}
          className={`p-2 rounded ${
            isListening ? "bg-red-500" : "bg-blue-500"
          } text-white`}
        >
          <FaMicrophone />
        </button>

        <input
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          type="text"
          placeholder="Type a message..."
          className="flex-1 text-sm md:text-base p-2 md:p-3 bg-transparent outline-none text-black"
        />

        <button className="bg-green-500 p-2 md:p-3 rounded-lg text-white">
          <IoSend />
        </button>
      </div>
      {isListening && <p className="text-red-500 text-sm">🎤 Listening...</p>}
    </form>
  );
};

export default SendInput;
