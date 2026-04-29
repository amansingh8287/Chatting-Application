import React from 'react'
import OtherUser from './OtherUser';
import useGetOtherUsers from '../hooks/useGetOtherUsers';
import {useSelector} from "react-redux";


const OtherUsers = () => {
    useGetOtherUsers();

    const { otherUsers } = useSelector(store => store.user);

    console.log("USERS:", otherUsers);

    return (
        <div className='flex flex-col gap-1'>
            {
                otherUsers && otherUsers.length > 0 ? (
                    otherUsers.map((user) => (
                        <OtherUser key={user._id} user={user} />
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-4">
                        No users found
                    </p>
                )
            }
        </div>
    )
}

export default OtherUsers