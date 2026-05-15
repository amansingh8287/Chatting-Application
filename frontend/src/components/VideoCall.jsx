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
  const isCallActive = useRef(false);

  const [stream, setStream] = useState(null);

  // 🎥 CAMERA
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s);
        if (myVideo.current) {
          myVideo.current.srcObject = s;
        }
      })
      .catch((err) => console.log("Camera error:", err));
  }, []);

  // 📞 START CALL (BUTTON CLICK)
  const startCall = () => {
    if (!stream) {
      console.log("❌ Stream not ready");
      return;
    }

    if (isCallActive.current) {
      console.log("⚠️ Call already active");
      return;
    }
    isCallActive.current = true;

    console.log("📞 STARTING CALL");

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },

          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "6415341860b6d63d76c2fb2d",
            credential: "Z/QGU6Qt+BPiQfkw",
          },
          {
            urls: "turn:global.relay.metered.ca:443?transport=tcp",
            username: "6415341860b6d63d76c2fb2d",
            credential: "Z/QGU6Qt+BPiQfkw",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=udp",
            username: "6415341860b6d63d76c2fb2d",
            credential: "Z/QGU6Qt+BPiQfkw",
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
      }
    });

    peer.on("iceConnectionStateChange", () => {
      console.log("ICE STATE:", peer._pc.iceConnectionState);
    });

    peerRef.current = peer;
  };

  // 📲 RECEIVER SIDE
  useEffect(() => {
    if (incomingCall && stream) {
      if (isCallActive.current) {
        console.log("⚠️ Receiver already has call");
        return;
      }

      isCallActive.current = true;

      console.log("📡 RECEIVER START");

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },

              {
                urls: "turn:global.relay.metered.ca:80?transport=tcp",
                username: "6415341860b6d63d76c2fb2d",
                credential: "Z/QGU6Qt+BPiQfkw",
              },
              {
                urls: "turn:global.relay.metered.ca:443?transport=tcp",
                username: "6415341860b6d63d76c2fb2d",
                credential: "Z/QGU6Qt+BPiQfkw",
              },
              {
                urls: "turn:global.relay.metered.ca:80?transport=udp",
                username: "6415341860b6d63d76c2fb2d",
                credential: "Z/QGU6Qt+BPiQfkw",
              },
            ],
          },
        },
      });

      peer.on("signal", (data) => {
        socket.emit("answerCall", {
          signal: data,
          to: incomingCall.from,
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log("🔥 RECEIVER GOT STREAM");

        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peer.on("iceConnectionStateChange", () => {
        console.log("ICE STATE:", peer._pc.iceConnectionState);
      });

      if (incomingCall?.signal) {
        peer.signal(incomingCall.signal);
      }

      peerRef.current = peer;
    }
  }, [incomingCall, stream]);

  // 📡 CALL ACCEPTED
  useEffect(() => {
    if (!socket) return;
    const handleCallAccepted = (signal) => {
      console.log("📡 CALL ACCEPTED");

      if (peerRef.current) {
        peerRef.current.signal(signal);
      }

      dispatch(acceptCall());
    };

    socket.off("callAccepted");
    socket.on("callAccepted", handleCallAccepted);

    return () => socket.off("callAccepted", handleCallAccepted);
  }, [socket]);

  // ❌ END CALL
  const leaveCall = () => {
    peerRef.current?.destroy();

    peerRef.current = null;

    isCallActive.current = false;
    dispatch(endCall());

    socket.emit("endCall", {
      to: selectedUser._id,
    });
  };

  // ❌ DO NOT HIDE COMPONENT
  // (important fix)

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black z-[999] flex items-center justify-center">
      {/* REMOTE VIDEO */}
      <video
        ref={userVideo}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* MY VIDEO */}
      <video
        ref={myVideo}
        autoPlay
        muted
        className="absolute w-40 h-48 top-4 right-4 rounded-lg border-2 border-white"
      />

      {/* START CALL BUTTON */}
      {!incomingCall && !callAccepted && (
        <button
          onClick={startCall}
          className="absolute bottom-20 bg-green-500 p-4 rounded-full text-white"
        >
          <IoCall size={24} />
        </button>
      )}

      {/* END CALL BUTTON */}
      {(incomingCall || callAccepted) && (
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
