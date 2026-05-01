import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser, setProfileUser, setShowProfile } from "../redux/userSlice";

const OtherUser = ({ user, isOnline }) => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);

  const selectedUserHandler = () => {
    dispatch(setSelectedUser(user));
    dispatch(setShowProfile(true));
  };

  return (
    <>
      <div
        onClick={selectedUserHandler}
        className={`${
          selectedUser?._id === user?._id
            ? "bg-zinc-200 text-black"
            : "text-white"
        } flex gap-2 hover:text-black items-center hover:bg-zinc-200 rounded p-2 cursor-pointer`}
      >
        {/* PROFILE IMAGE */}
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img
              src={user?.profilePhoto}
              alt="user-profile"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setProfileUser(user));
                dispatch(setShowProfile(true));
              }}
            />
          </div>
        </div>

        {/* NAME */}
        <div className="flex flex-col flex-1">
          <p>{user?.fullName}</p>

          {isOnline ? (
            <span className="text-green-500">● Online</span>
          ) : (
            <span className="text-gray-400">Offline</span>
          )}
        </div>
      </div>

      <div className="divider my-0 py-0 h-1"></div>
    </>
  );
};

export default OtherUser;