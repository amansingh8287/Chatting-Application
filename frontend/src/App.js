import Signup from "./components/Signup";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import { useEffect } from "react";
import { connectSocket, getSocket } from "./socket";
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers, setIncomingCall, endCall } from "./redux/userSlice";
import UserProfileModal from "./components/UserProfileModal";
import ForgotPassword from "./components/ForgotPassword";
import IncomingCallPopup from "./components/IncomingCallPopup"; 
import VideoCall from "./components/VideoCall";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
]);

function App() {
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    //  SAFE CHECK
    if (!authUser?._id) return;

    const socket = connectSocket(authUser._id);


    //  safety
    if (!socket) return;

    //  connection log
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    //  online users
    const handleOnlineUsers = (onlineUsers) => {
      console.log("ONLINE USERS:", onlineUsers);
      dispatch(setOnlineUsers(onlineUsers));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);
    

    // =========================
    //  VIDEO CALL EVENTS
    // =========================

    socket.on("incomingCall", (data) => {
      console.log("Incoming Call:", data);
      dispatch(setIncomingCall(data));
    });

    socket.on("callEnded", () => {
      console.log(" Call Ended");
      dispatch(endCall());
    });

    socket.on("callRejected", () => {
      console.log(" Call Rejected");
      dispatch(endCall());
    });

    // =========================
    // CLEANUP
    // =========================
    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("incomingCall");
      socket.off("callEnded");
      socket.off("callRejected");
      socket.disconnect();
    };

  }, [authUser, dispatch]);


  return (
    <div className="h-screen w-full">
      <RouterProvider router={router} />
      <IncomingCallPopup />
      <VideoCall />
      <UserProfileModal />
    </div>
  );
}

export default App;