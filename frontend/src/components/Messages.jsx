import React from 'react'
import Message from './Message'
import useGetMessages from '../hooks/useGetMessages';
import { useSelector } from "react-redux";
import useGetRealTimeMessage from '../hooks/useGetRealTimeMessage';

const Messages = () => {
    useGetMessages();
    useGetRealTimeMessage();

    const { messages } = useSelector(store => store.message);

    return (
        <div className="flex-1 overflow-y-auto px-2 md:px-4">

            {!messages || messages.length === 0 ? (
                <p className="text-center text-gray-400 mt-4">
                    No messages yet
                </p>
            ) : (
                messages.map((message) => {
                    //  guard lagao
                    if (!message || !message._id) return null;

                    return (
                        <Message key={message._id} message={message} />
                    );
                })
            )}

        </div>
    )
}

export default Messages;