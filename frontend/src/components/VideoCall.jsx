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
  const socket = getSocket();

  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();

  const [stream, setStream] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(true);

  // 🎥 CAMERA
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        console.log("🎥 LOCAL STREAM:", s);
        setStream(s);
        if (myVideo.current) {
          myVideo.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.log("Camera error:", err);
      });
  }, []);

  // 📞 CALLER SIDE
  useEffect(() => {
    if (stream && selectedUser && !callAccepted) {
      console.log("📞 CALLER PEER CREATED");

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
          ],
        },
      });

      peer.on("signal", (data) => {
        console.log("📡 SENDING SIGNAL");

        socket.emit("callUser", {
          userToCall: selectedUser._id,
          signalData: data,
          from: authUser._id,
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log("🔥 CALLER GOT STREAM");

        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peerRef.current = peer;
    }
  }, [stream, selectedUser, callAccepted]);

  // 📲 RECEIVER SIDE
  useEffect(() => {
    if (incomingCall && callAccepted && stream) {
      console.log("📡 RECEIVER START");

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
          ],
        },
      });

      peer.on("signal", (data) => {
        console.log("📡 SENDING ANSWER");
        socket.emit("answerCall", {
          signal: data,
          to: incomingCall.from,
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log("🔥 RECEIVER GOT STREAM");
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
          userVideo.current.play().catch(() => {});
        }
      });

      // 🔥 SAFE SIGNAL APPLY
      if (incomingCall?.signal) {
        try {
          peer.signal(incomingCall.signal);
        } catch (err) {
          console.log("❌ SIGNAL ERROR:", err);
        }
      }

      peerRef.current = peer;
    }
  }, [callAccepted, stream, incomingCall]);

  // 🔁 CALL ACCEPTED (caller side)
  useEffect(() => {
    const handleCallAccepted = (signal) => {
      console.log("📡 SIGNAL BACK RECEIVED");

      if (peerRef.current && signal) {
        peerRef.current.signal(signal);
      }

      dispatch(acceptCall());
    };

    socket.on("callAccepted", handleCallAccepted);

    return () => socket.off("callAccepted", handleCallAccepted);
  }, []);

  // ❌ END CALL
  const leaveCall = () => {
    peerRef.current?.destroy();
    dispatch(endCall());

    socket.emit("endCall", {
      to: selectedUser._id,
    });
  };

  // ⌨ ESC TO END CALL
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        leaveCall();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ❌ hide if no call
  if (!callAccepted && !incomingCall) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black z-[999] flex items-center justify-center">
      {/* 🎥 REMOTE VIDEO */}
      <video
        ref={userVideo}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* 🎥 MY VIDEO */}
      <video
        ref={myVideo}
        autoPlay
        muted
        className={`absolute rounded-lg border-2 border-white ${
          isFullScreen ? "w-40 h-48 top-4 right-4" : "w-24 h-32 top-2 right-2"
        }`}
      />

      {/* FULLSCREEN BUTTON */}
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-4 left-4 bg-white/20 text-white px-3 py-1 rounded"
      >
        {isFullScreen ? "Exit" : "Full"}
      </button>

      {/* END CALL */}
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
