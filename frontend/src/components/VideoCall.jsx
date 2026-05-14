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
  const [isCalling, setIsCalling] = useState(false);

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
      .catch((err) => console.log("Camera error:", err));
  }, []);

  // 📞 START CALL (BUTTON BASED)
  const startCall = () => {
    if (!stream) {
      console.log("❌ Stream not ready");
      return;
    }

    console.log("📞 STARTING CALL");
    setIsCalling(true);

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
      console.log("📡 SENDING SIGNAL:", data);

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
        userVideo.current.play().catch(() => {});
      }
    });

    peerRef.current = peer;
  };

  useEffect(() => {
    const handleStartCall = () => {
      if (stream) {
        startCall(); // ✔ safe
      } else {
        console.log("⏳ waiting for stream...");
      }
    };

    window.addEventListener("start-call", handleStartCall);

    return () => {
      window.removeEventListener("start-call", handleStartCall);
    };
  }, [stream]);

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

      if (incomingCall?.signal) {
        try {
          peer.signal(incomingCall.signal);
        } catch (err) {
          console.log("❌ SIGNAL ERROR:", err);
        }
      }

      peerRef.current = peer;
    }
  }, [callAccepted, incomingCall, stream]);

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

    setIsCalling(false);
  };

  // ⌨ ESC TO END CALL
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") leaveCall();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ❌ HIDE IF NOTHING
  if (!incomingCall && !isCalling && !callAccepted) return null;

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
        className="absolute w-40 h-48 top-4 right-4 rounded-lg border-2 border-white"
      />

      {/* 📞 START CALL BUTTON */}
      {!incomingCall && !callAccepted && (
        <button
          onClick={startCall}
          className="absolute bottom-20 bg-green-500 p-4 rounded-full text-white"
        >
          <IoCall size={24} />
        </button>
      )}

      {/* ❌ END CALL */}
      {(callAccepted || isCalling) && (
        <button
          onClick={leaveCall}
          className="absolute bottom-6 bg-red-500 p-4 rounded-full text-white"
        >
          <IoCall size={24} style={{ transform: "rotate(135deg)" }} />
        </button>
      )}
    </div>
  );
};

export default VideoCall;
