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
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
     if (!Array.isArray(state.messages)) {
       state.messages = [];
     }
     state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
