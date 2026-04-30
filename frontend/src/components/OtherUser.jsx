import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { setProfileUser, setShowProfile } from "../redux/userSlice";

const OtherUser = ({ user }) => {
  const dispatch = useDispatch();
  const { selectedUser, onlineUsers } = useSelector((store) => store.user);
  const isOnline = onlineUsers?.includes(user._id);
  const selectedUserHandler = (user) => {
    dispatch(setSelectedUser(user));
    dispatch(setShowProfile(true));
  };
  return (
    <>
      <div
        onClick={() => selectedUserHandler(user)} //  सिर्फ chat open
        className={` ${
          selectedUser?._id === user?._id
            ? "bg-zinc-200 text-black"
            : "text-white"
        } 
             flex gap-2 hover:text-black items-center hover:bg-zinc-200 rounded p-2 cursor-pointer`}
      >
        {/* PROFILE IMAGE */}
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img
              src={user?.profilePhoto}
              alt="user-profile"
              onClick={(e) => {
                e.stopPropagation(); //  chat click रोकता है
                dispatch(setProfileUser(user));
                dispatch(setShowProfile(true));
              }}
            />
          </div>
        </div>

        {/* NAME */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between gap-2">
            <div className="flex flex-col">
              <p>{user?.fullName}</p>

              <span className="text-xs">
                {isOnline
                  ? "🟢 Online"
                  : `Last seen today at ${new Date(user?.lastSeen).toLocaleTimeString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divider my-0 py-0 h-1"></div>
    </>
  );
};

export default OtherUser;
