// import {createSlice} from "@reduxjs/toolkit";

// const messageSlice = createSlice({
//     name:"message",
//     initialState:{
//         messages:[],
//     },
//     reducers:{
//         setMessages:(state,action)=>{
//             state.messages = action.payload;
//         }
//     }
// });
// export const {setMessages} = messageSlice.actions;
// export default messageSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
  },
  reducers: {

    // ✅ full replace (API + functional update)
    setMessages: (state, action) => {
      if (typeof action.payload === "function") {
        state.messages = action.payload(state.messages);
      } else {
        state.messages = action.payload;
      }
    }, 

    // 🔥 realtime ke liye
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // 🧹 chat change hone par clear
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;