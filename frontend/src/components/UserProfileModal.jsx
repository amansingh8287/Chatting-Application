import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setShowProfile } from "../redux/userSlice";

const UserProfileModal = () => {
  const { profileUser, showProfile } = useSelector(store => store.user);
  const dispatch = useDispatch();

  if (!showProfile || !profileUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      {/* CARD */}
      <div className="bg-white rounded-xl p-6 w-[300px] text-center relative shadow-lg">

        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={() =>{ dispatch(setShowProfile(false));
                         dispatch(setProfileUser(null));
            }}
          className="absolute top-2 right-3 text-xl font-bold"
        >
          ✖
        </button>

        {/* 👤 PROFILE IMAGE */}
        <img
          src={profileUser?.profilePhoto}
          alt="profile"
          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border"
        />

        {/* 🧑 NAME */}
        <h2 className="text-lg font-semibold">{profileUser?.fullName}</h2>

        {/* 🆔 USERNAME */}
        <p className="text-gray-500">@{User?.username}</p>

      </div>

    </div>
  );
};

export default UserProfileModal;