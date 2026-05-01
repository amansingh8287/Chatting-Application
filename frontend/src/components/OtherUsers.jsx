import React from 'react';
import OtherUser from './OtherUser';
import useGetOtherUsers from '../hooks/useGetOtherUsers';
import { useSelector } from "react-redux";

const OtherUsers = () => {
    useGetOtherUsers();

    const { users, onlineUsers } = useSelector(store => store.user);

    console.log("USERS:", users);

    return (
        <div className='flex flex-col gap-1'>
            {
                users && users.length > 0 ? (
                    users.map((user) => {
                        const isOnline = onlineUsers?.includes(user._id);

                        return (
                            <OtherUser 
                                key={user._id} 
                                user={user} 
                                isOnline={isOnline}   // 🔥 IMPORTANT
                            />
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 mt-4">
                        No users found
                    </p>
                )
            }
        </div>
    );
};

export default OtherUsers;