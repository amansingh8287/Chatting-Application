import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        authUser:null,
        otherUsers:[],
        selectedUser:null,
        onlineUsers:[],
        profileUser: null,
        showProfile: false
    },
    reducers:{
        setAuthUser:(state,action)=>{
            state.authUser = action.payload;
        },
        setOtherUsers:(state, action)=>{
            state.otherUsers = action.payload;
        },
        setSelectedUser:(state,action)=>{
            state.selectedUser = action.payload;
        },
        setOnlineUsers:(state,action)=>{
            state.onlineUsers = action.payload;
        },
        setProfileUser: (state, action) => {
           state.profileUser = action.payload;
        },
        setShowProfile: (state, action) => {
          state.showProfile = action.payload;
        }
    }
});
export const {setAuthUser,setOtherUsers,setSelectedUser,setOnlineUsers, setProfileUser,setShowProfile} = userSlice.actions;
export default userSlice.reducer;