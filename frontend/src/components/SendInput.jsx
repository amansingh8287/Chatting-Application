import React, { useState, useRef, useEffect } from "react";
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

  const typingTimeout = useRef(null);
  const silenceTimeoutRef = useRef(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      // recognition.lang = "hi-IN";

      //  HANDLERS HERE
      recognition.onresult = (event) => {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }

        if (transcript) {
          setMessage((prev) => prev + " " + transcript);
        }

        //  reset timer on speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        silenceTimeoutRef.current = setTimeout(() => {
          console.log("⏹ Auto stop (2s silence)");
          recognition.stop();
          setIsListening(false);
          isListeningRef.current = false;
        }, 3000);
      };

      recognition.onend = () => {
        console.log("🎤 stopped");

        // 🔥 clear timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            console.log("restart failed");
          }
        }
      };

      recognition.onerror = (err) => {
        console.log("🎤 ERROR:", err.error);

        //  clear timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        if (err.error === "network") {
          console.log("🌐 network issue");
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }

        if (err.error === "not-allowed") {
          alert("Mic permission denied ❌");
        }

        setIsListening(false);
        isListeningRef.current = false;
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      alert("Speech not supported");
      return;
    }

    if (isListening) return;

    setIsListening(true);
    isListeningRef.current = true;

    try {
      recognition.start();
    } catch {
      console.log("already started");
    }
    //  auto stop if no speech
    silenceTimeoutRef.current = setTimeout(() => {
      console.log("⏹ No speech → auto stop");
      recognition.stop();
      setIsListening(false);
      isListeningRef.current = false;
    }, 3000);
  };

  const handleTyping = (value) => {
    setMessage(value);

    const socket = getSocket();
    if (!socket || !selectedUser?._id) return;

    socket.emit("typing", {
      receiverId: selectedUser._id,
    });
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
          disabled={isListening}
          className={`p-2 rounded ${
            isListening ? "bg-gray-400" : "bg-blue-500"
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
