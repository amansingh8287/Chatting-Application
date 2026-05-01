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
  const { messages } = useSelector((store) => store.message);

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/v1/message/${selectedUser._id}`,
          { withCredentials: true },
        );

        dispatch(setMessages(res.data));

        // mark seen only once on open
        await axios.put(
          `${BASE_URL}/api/v1/message/seen/${selectedUser._id}`,
          {},
          { withCredentials: true },
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]); 
};

export default useGetMessages;
