import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import MessageContainer from './MessageContainer'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const { authUser } = useSelector(store => store.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, []);
  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[300px] h-[45%] md:h-full">
        <Sidebar />
      </div>

      {/* Chat */}
      <div className="flex-1 h-[55%] md:h-full">
        <MessageContainer />
      </div>
    </div>
  )
}

export default HomePage