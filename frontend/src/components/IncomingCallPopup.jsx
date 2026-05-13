import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptCall, endCall } from "../redux/userSlice";
import { getSocket } from "../socket";

const IncomingCallPopup = () => {
  const { incomingCall } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const socket = getSocket();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2">📞 Incoming Call</h2>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => dispatch(acceptCall())}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Accept
          </button>

          <button
            onClick={() => {
              socket.emit("rejectCall", { to: incomingCall.from });
              dispatch(endCall());
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallPopup;