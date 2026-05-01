import Signup from './components/Signup';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from './components/HomePage';
import Login from './components/Login';
import { useEffect } from 'react';
import { connectSocket, getSocket } from "./socket";
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers } from './redux/userSlice';
import UserProfileModal from "./components/UserProfileModal";
import ForgotPassword from "./components/ForgotPassword";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
]);

function App() {
  const { authUser } = useSelector(store => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!authUser?._id) return;

    //  connect socket AFTER login
    connectSocket(authUser._id);

    const socket = getSocket();

    // connection log
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    // online users
    socket.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    //  cleanup (VERY IMPORTANT)
    return () => {
      socket.disconnect();
    };

  }, [authUser, dispatch]);

  return (
    <div className="h-screen w-full">
      <RouterProvider router={router} />
      <UserProfileModal />
    </div>
  );
}

export default App;