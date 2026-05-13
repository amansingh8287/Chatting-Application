import React, { useRef, useEffect, useState } from "react";
import Peer from "simple-peer";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../socket";
import { endCall } from "../redux/userSlice";

const VideoCall = () => {
  const { selectedUser, incomingCall, callAccepted } = useSelector((s) => s.user);
  const dispatch = useDispatch();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [stream, setStream] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
  }, []);

  const callUser = () => {
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
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  useEffect(() => {
    if (callAccepted && incomingCall) {
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
        userVideo.current.srcObject = currentStream;
      });

      peer.signal(incomingCall.signal);
      connectionRef.current = peer;
    }
  }, [callAccepted]);

  const leaveCall = () => {
    connectionRef.current?.destroy();
    dispatch(endCall());

    socket.emit("endCall", {
      to: selectedUser._id,
    });
  };

  return (
    <div className="p-4">
      <button onClick={callUser} className="bg-blue-500 text-white p-2 rounded">
         Call
      </button>

      <div className="flex gap-4 mt-4">
        <video ref={myVideo} autoPlay muted className="w-40 rounded" />
        <video ref={userVideo} autoPlay className="w-40 rounded" />
      </div>

      <button onClick={leaveCall} className="bg-red-500 text-white p-2 mt-4 rounded">
        End Call
      </button>
    </div>
  );
};

export default VideoCall;