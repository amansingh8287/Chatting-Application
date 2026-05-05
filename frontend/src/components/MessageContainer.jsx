
import React, { useEffect } from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { getSocket } from "../socket";
import chatBg from "../assets/chat-bg.jpg";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";

const MessageContainer = () => {
  const { selectedUser, authUser, onlineUsers } = useSelector(
    (store) => store.user,
  );

  const { isTyping } = useGetRealTimeMessage();

  const isOnline = onlineUsers?.includes(selectedUser?._id);

  const socket = getSocket();

  // 🔥 TYPING LISTENER
  useEffect(() => {
    socket?.on("typing", () => {
      setTimeout(() => {}, 1500);
    });

    return () => socket?.off("typing");
  }, []);

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
          {/* 🔥 overlay */}
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]"></div>

          {/* 🔥 content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* HEADER */}
            <div className="flex gap-2 items-center px-4 py-2 bg-white/20 backdrop-blur-md border-b border-white/20 text-black">
              <img
                src={selectedUser?.profilePhoto}
                className="w-10 h-10 rounded-full"
              />

              <div className="flex flex-col">
                <p className="font-semibold">{selectedUser?.fullName}</p>

                <span className="text-xs text-green-600">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* 🔥 TYPING INDICATOR */}
            {isTyping && (
              <p className="text-sm text-gray-600">
                 Typing...
              </p>
            )}
            {/* MESSAGES */}
            <Messages />

            {/* INPUT */}
            <SendInput />
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
