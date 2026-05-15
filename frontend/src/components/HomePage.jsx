import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoCall from "./VideoCall";

const HomePage = () => {
  const { authUser } = useSelector((store) => store.user);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const { callAccepted } = useSelector((store) => store.user);
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, []);
  return (
    // <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
    //   <div className="w-full md:w-[300px] h-[45%] md:h-full">
    //     <Sidebar />
    //   </div>

    //   <div className="flex-1 h-[55%] md:h-full">
    //     <MessageContainer />
    //   </div>
    // </div>

    <div className="h-screen w-full flex overflow-hidden">

    {/* SIDEBAR */}
    <div className={`w-full md:w-[300px] ${showChat ? "hidden md:block" : "block"}`}>
      <Sidebar setShowChat={setShowChat} />
    </div>

    {/* CHAT */}
    <div className={`flex-1 ${showChat ? "block" : "hidden md:block"}`}>
      <MessageContainer showChat={showChat} setShowChat={setShowChat} />
    </div>
    </div>
  );
};

export default HomePage;
