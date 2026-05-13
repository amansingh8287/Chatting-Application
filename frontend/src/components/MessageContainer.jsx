import React, { useEffect } from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { getSocket } from "../socket";
import chatBg from "../assets/chat-bg.jpg";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";
import VideoCall from "./VideoCall";
import { IoCall } from "react-icons/io5";
import Peer from "simple-peer";

const MessageContainer = () => {
  const { selectedUser, authUser, onlineUsers, callAccepted } = useSelector(
    (store) => store.user,
  );

  const { isTyping } = useGetRealTimeMessage();

  const isOnline = onlineUsers?.includes(selectedUser?._id);

  const socket = getSocket();

  // TYPING LISTENER
  useEffect(() => {
    socket?.on("typing", () => {
      setTimeout(() => {}, 1500);
    });

    return () => socket?.off("typing");
  }, []);

  const handleCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      });

      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: selectedUser._id,
          signalData: data,
          from: authUser._id,
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log(" CALLER GOT REMOTE STREAM");

        const video = document.getElementById("userVideo");
        if (video) video.srcObject = remoteStream;
      });

      // SAVE PEER GLOBAL
      window.peer = peer;
      window.localStream = stream;

    } catch (err) {
      console.log("Call error:", err);
    }
  };

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
            <div className="flex justify-between items-center px-4 py-2 bg-white/20 backdrop-blur-md border-b border-white/20 text-black">
              {/* LEFT SIDE */}
              <div className="flex gap-2 items-center">
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

              {/* RIGHT SIDE CALL BUTTON */}
               <button
                onClick={handleCall}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg"
              >
                <IoCall size={20} />
              </button>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 overflow-y-auto">
              {callAccepted ? (
                <VideoCall />
              ) : (
                <>
                  {isTyping && (
                    <p className="text-sm text-gray-200 px-4 py-1">
                      Typing...
                    </p>
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