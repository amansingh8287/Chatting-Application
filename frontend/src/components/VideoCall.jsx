import React, { useRef, useEffect, useState } from "react";
import Peer from "simple-peer";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../socket";
import { endCall, acceptCall } from "../redux/userSlice";
import { IoCall } from "react-icons/io5";

const VideoCall = () => {
  const { selectedUser, incomingCall, callAccepted, authUser } = useSelector(
    (s) => s.user,
  );
  const dispatch = useDispatch();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [stream, setStream] = useState(null);
  const socket = getSocket();

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

  //  CALLER SIDE
  useEffect(() => {
    if (!incomingCall && selectedUser && stream) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
          ],
        },
      });

      peer.on("signal", (data) => {
        console.log("🎥 MY STREAM:", stream);
        socket.emit("callUser", {
          userToCall: selectedUser._id,
          signalData: data,
          from: authUser._id,
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log(" CALLER GOT STREAM");
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      connectionRef.current = peer;
    }
  }, [stream]);

  //  RECEIVER SIDE
  useEffect(() => {
    if (callAccepted && incomingCall && stream) {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
          ],
        },
      });

      peer.on("signal", (data) => {
        socket.emit("answerCall", {
          signal: data,
          to: incomingCall.from,
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log(" RECEIVER GOT STREAM");
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peer.signal(incomingCall.signal);

      connectionRef.current = peer;
    }
  }, [callAccepted, stream]);

  //  CALL ACCEPTED
  useEffect(() => {
    socket.on("callAccepted", (signal) => {
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
      dispatch(acceptCall());
    });

    return () => socket.off("callAccepted");
  }, []);

  const leaveCall = () => {
    connectionRef.current?.destroy();
    dispatch(endCall());

    socket.emit("endCall", {
      to: selectedUser._id,
    });
  };

  if (!callAccepted && !incomingCall) return null;

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      <video
        ref={userVideo}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <video
        ref={myVideo}
        autoPlay
        muted
        className="w-32 h-40 absolute top-4 right-4 rounded-lg border-2 border-white"
      />

      <button
        onClick={leaveCall}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 p-4 rounded-full"
      >
        <IoCall size={24} style={{ transform: "rotate(135deg)" }} />
      </button>
    </div>
  );
};

export default VideoCall;
