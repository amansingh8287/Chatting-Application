// import React, { useEffect, useRef } from 'react'
// import {useSelector} from "react-redux";

// const Message = ({message}) => {
//     const scroll = useRef();
//     const {authUser,selectedUser} = useSelector(store=>store.user);

//     useEffect(()=>{
//         scroll.current?.scrollIntoView({behavior:"smooth"});
//     },[message]);
    
//     return (
//         <div ref={scroll} className={`chat ${message?.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`}>
//             <div className="chat-image avatar">
//                 <div className="w-10 rounded-full">
//                     <img
//                       src={
//                        message?.senderId === authUser?._id
//                        ? authUser?.profilePhoto
//                        : selectedUser?.profilePhoto
//                       }
//                      alt="user-profile"
//                      className="w-10 h-10 object-cover rounded-full"
//                    />
//                 </div>
//             </div>
//             <div className="chat-header">
//                 <time className="text-xs opacity-50 text-white">12:45</time>
//             </div>
//             <div className={`chat-bubble ${message?.senderId !== authUser?._id ? 'bg-gray-200 text-black' : ''} `}>{message?.message}</div>
//         </div>
//     )
// }

// export default Message

import React, { useEffect, useRef } from 'react'
import { useSelector } from "react-redux";

const Message = ({ message }) => {
    const scroll = useRef();
    const { authUser, selectedUser } = useSelector(store => store.user);

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    const isMe = message?.senderId === authUser?._id;

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div ref={scroll} className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-2`}>
            
            <div className={`max-w-xs px-4 py-2 rounded-lg shadow 
                ${isMe 
                    ? 'bg-green-500 text-white rounded-br-none' 
                    : 'bg-gray-300 text-black rounded-bl-none'}`}>
                
                <p>{message?.message}</p>

                <p className={`text-xs mt-1 text-right ${isMe ? 'text-gray-200' : 'text-gray-600'}`}>
                    {formatTime(message?.createdAt)}
                </p>
            </div>
        </div>
    )
}

export default Message;