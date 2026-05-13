import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    otherUsers: [],
    selectedUser: null,
    onlineUsers: [],
    users: [],
    profileUser: null,
    showProfile: false,
    incomingCall: null,
    callAccepted: false,
    callEnded: false,
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setProfileUser: (state, action) => {
      state.profileUser = action.payload;
    },
    setShowProfile: (state, action) => {
      state.showProfile = action.payload;
    },
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    acceptCall: (state) => {
      state.callAccepted = true;
      state.incomingCall = null;
    },
    endCall: (state) => {
      state.callEnded = true;
      state.callAccepted = false;
      state.incomingCall = null;
    },
  },
});
export const {
  setAuthUser,
  setOtherUsers,
  setUsers,
  setSelectedUser,
  setOnlineUsers,
  setProfileUser,
  setShowProfile,
  setIncomingCall,
  acceptCall,   
  endCall
} = userSlice.actions;
export default userSlice.reducer;
