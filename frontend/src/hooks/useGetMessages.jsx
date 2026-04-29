// import React, { useEffect } from 'react'
// import axios from "axios";
// import {useSelector,useDispatch} from "react-redux";
// import { setMessages } from '../redux/messageSlice';
// import { BASE_URL } from '..';

// const useGetMessages = () => {
//     const {selectedUser} = useSelector(store=>store.user);
//     const dispatch = useDispatch();
//     useEffect(() => {
//         const fetchMessages = async () => {
//             try {
//                 axios.defaults.withCredentials = true;
//                 const res = await axios.get(`${BASE_URL}/api/v1/message/${selectedUser?._id}`);
//                 dispatch(setMessages(res.data))
//             } catch (error) {
//                 console.log(error);
//             }
//         }
//         fetchMessages();
//     }, [selectedUser?._id,setMessages]);
// }

// export default useGetMessages;

import { useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, clearMessages } from "../redux/messageSlice";
import { BASE_URL } from "..";

const useGetMessages = () => {
  const { selectedUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    // ❌ agar user select nahi hai to kuch mat karo
    if (!selectedUser?._id) {
      dispatch(clearMessages());
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/v1/message/${selectedUser._id}`,
        );

        dispatch(setMessages(res.data));

        // 🔥 MARK AS SEEN
        await axios.put(
          `${BASE_URL}/api/v1/message/seen/${selectedUser._id}`,
          {},
          { withCredentials: true },
        );
      } catch (error) {
        console.log(error);
      }
    };

    // 🔥 pehle clear karo phir fetch
    dispatch(clearMessages());
    fetchMessages();
  }, [selectedUser?._id, dispatch]);
};

export default useGetMessages;
