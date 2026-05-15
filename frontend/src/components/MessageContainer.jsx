import React, { useEffect, useState } from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useSelector } from "react-redux";
import { getSocket } from "../socket";
import chatBg from "../assets/chat-bg.jpg";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";
import VideoCall from "./VideoCall";
import { IoCall } from "react-icons/io5";

const MessageContainer = ({showChat, setShowChat}) => {
  const { selectedUser, authUser, onlineUsers, callAccepted } = useSelector(
    (store) => store.user,
  );

  const { isTyping } = useGetRealTimeMessage();
  const isOnline = onlineUsers?.includes(selectedUser?._id);

  const socket = getSocket();
  const [callTrigger, setCallTrigger] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setShowChat(true); // mobile me chat open
    }
  }, [selectedUser]);

  useEffect(() => {
    socket?.on("typing", () => {
      setTimeout(() => {}, 1500);
    });

    return () => socket?.off("typing");
  }, []);

  useEffect(() => {
    setCallTrigger(false); // 🔥 RESET
  }, [selectedUser]);

  useEffect(() => {
    if (!callAccepted) {
      setCallTrigger(false);
    }
  }, [callAccepted]);

  return (
    <>
      {selectedUser !== null ? (
        <div
          className="h-full w-full flex flex-col relative rounded-xl overflow-hidden bg-white/10 backdrop-blur-[2px] border border-white/20 shadow-2xl"
          style={{
            backgroundImage: `url(${chatBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]"></div>

          <div className="relative z-10 flex flex-col h-full">
            {/* HEADER */}
            <div className="flex justify-between items-center px-4 py-2 bg-white/20 backdrop-blur-md border-b border-white/20 text-black">
              {/* LEFT SIDE */}
              <div className="flex gap-2 items-center">
                {/* 🔙 BACK BUTTON (ONLY MOBILE) */}
                <button
                  onClick={() => setShowChat(false)}
                  className="md:hidden text-xl mr-1"
                >
                  ←
                </button>

                {/* PROFILE IMAGE */}
                <img
                  src={selectedUser?.profilePhoto}
                  className="w-10 h-10 rounded-full"
                />

                {/* NAME + STATUS */}
                <div className="flex flex-col">
                  <p className="font-semibold">{selectedUser?.fullName}</p>
                  <span className="text-xs text-green-600">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* 📞 CALL BUTTON */}
              <button
                onClick={() => {
                  setCallTrigger(true);
                }}
                className="bg-green-500 p-2 rounded-full text-white"
              >
                <IoCall />
              </button>
            </div>

            {/* MAIN */}
            <div className="flex-1 overflow-y-auto relative">
              {/* ✅ VideoCall only when needed */}
              {callAccepted === true ||
              (callTrigger === true && selectedUser) ? (
                <VideoCall startCallTrigger={callTrigger} />
              ) : (
                <>
                  {isTyping && (
                    <p className="text-sm text-gray-200 px-4 py-1">Typing...</p>
                  )}
                  <Messages />
                </>
              )}
            </div>

            {!callAccepted && <SendInput />}
          </div>
        </div>
      ) : (
        <div className="md:min-w-[550px] flex flex-col justify-center items-center">
          <h1 className="text-4xl text-white font-bold">
            Hi, {authUser?.fullName}
          </h1>
          <h1 className="text-2xl text-white">Let's start conversation</h1>
        </div>
      )}
    </>
  );
};

export default MessageContainer;
