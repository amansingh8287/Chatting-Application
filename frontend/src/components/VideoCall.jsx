import React, { useRef, useEffect, useState } from "react";
import Peer from "simple-peer";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../socket";
import { endCall } from "../redux/userSlice";
import { IoCall } from "react-icons/io5";

const VideoCall = () => {
  const { selectedUser, incomingCall, callAccepted } = useSelector((s) => s.user);
  const dispatch = useDispatch();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [stream, setStream] = useState(null);
  const socket = getSocket();

  //  get camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });
  }, []);

  //  CALL (initiator)
  useEffect(() => {
    if (!callAccepted && !incomingCall && selectedUser && stream) {
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
          from: selectedUser._id,
        });
      });

      peer.on("stream", (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }
      });

      socket.on("callAccepted", (signal) => {
        peer.signal(signal);
      });

      connectionRef.current = peer;
    }
  }, [stream]);

  // ANSWER
  useEffect(() => {
    if (callAccepted && incomingCall && stream) {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      });

      peer.on("signal", (data) => {
        socket.emit("answerCall", {
          signal: data,
          to: incomingCall.from,
        });
      });

      peer.on("stream", (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }
      });

      peer.signal(incomingCall.signal);

      connectionRef.current = peer;
    }
  }, [callAccepted, stream]);

  //  END CALL
  const leaveCall = () => {
    connectionRef.current?.destroy();
    dispatch(endCall());

    socket.emit("endCall", {
      to: selectedUser._id,
    });
  };

  // DON'T RENDER IF NOT IN CALL
  if (!callAccepted) return null;

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">

      {/* REMOTE VIDEO */}
      <video
        ref={userVideo}
        autoPlay
        className="w-full h-full object-cover"
      />

      {/* MY VIDEO (small) */}
      <video
        ref={myVideo}
        autoPlay
        muted
        className="w-32 h-40 object-cover absolute top-4 right-4 rounded-lg border-2 border-white"
      />

      {/* END CALL BUTTON */}
      <button
        onClick={leaveCall}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg"
      >
        <IoCall size={24} style={{ transform: "rotate(135deg)" }} />
      </button>
    </div>
  );
};

export default VideoCall;