// import React, { useState } from 'react'
// import { BiSearchAlt2 } from "react-icons/bi";
// import OtherUsers from './OtherUsers';
// import axios from "axios";
// import toast from "react-hot-toast";
// import {useNavigate} from "react-router-dom";
// import {useSelector, useDispatch} from "react-redux";
// import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
// import { setMessages } from '../redux/messageSlice';
// import { BASE_URL } from '..';
// import { clearMessages } from "../redux/messageSlice";
 
// const Sidebar = () => {
//     const [search, setSearch] = useState("");
//     const {otherUsers} = useSelector(store=>store.user);
//     const dispatch = useDispatch();

//     const navigate = useNavigate();

//     const logoutHandler = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
//             navigate("/login");
//             toast.success(res.data.message);
//             dispatch(setAuthUser(null));
//             // dispatch(setMessages(null));
//             dispatch(clearMessages());
//             dispatch(setOtherUsers(null));
//             dispatch(setSelectedUser(null));
//         } catch (error) {
//             console.log(error);
//         }
//     }
//     const searchSubmitHandler = (e) => {
//         e.preventDefault();
//         const conversationUser = otherUsers?.find((user)=> user.fullName.toLowerCase().includes(search.toLowerCase()));
//         if(conversationUser){
//             dispatch(setOtherUsers([conversationUser]));
//         }else{
//             toast.error("User not found!");
//         }
//     }
//     return (
//         <div className='border-r border-slate-500 p-4 flex flex-col'>
//             <form onSubmit={searchSubmitHandler} action="" className='flex items-center gap-2'>
//                 <input
//                     value={search}
//                     onChange={(e)=>setSearch(e.target.value)}
//                     className='input input-bordered rounded-md' type="text"
//                     placeholder='Search...'
//                 />
//                 <button type='submit' className='btn bg-zinc-700 text-white'>
//                     <BiSearchAlt2 className='w-6 h-6 outline-none'/>
//                 </button>
//             </form>
//             <div className="divider px-3"></div> 
//             <OtherUsers/> 
//             <div className='mt-2'>
//                 <button onClick={logoutHandler} className='btn btn-sm'>Logout</button>
//             </div>
//         </div>
//     )
// }

// export default Sidebar

import React, { useState } from 'react'
import { BiSearchAlt2 } from "react-icons/bi";
import OtherUsers from './OtherUsers';
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { clearMessages } from "../redux/messageSlice";
import { BASE_URL } from '..';

const Sidebar = () => {
    const [search, setSearch] = useState("");

    // ✅ ADD THIS
    const { otherUsers, authUser } = useSelector(store => store.user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
            navigate("/login");
            toast.success(res.data.message);

            dispatch(setAuthUser(null));
            dispatch(clearMessages());
            dispatch(setOtherUsers(null));
            dispatch(setSelectedUser(null));

        } catch (error) {
            console.log(error);
        }
    }

    const searchSubmitHandler = (e) => {
        e.preventDefault();

        const conversationUser = otherUsers?.find((user) =>
            user.fullName.toLowerCase().includes(search.toLowerCase())
        );

        if (conversationUser) {
            dispatch(setOtherUsers([conversationUser]));
        } else {
            toast.error("User not found!");
        }
    }

    return (
        <div className="h-full w-full flex flex-col p-3 md:p-4 bg-white/20 backdrop-blur-lg border-r border-slate-400">

            {/* 👤 MY PROFILE */}
            <div className="flex items-center gap-3 mb-4 p-2 bg-white/30 backdrop-blur-md rounded-lg">
                <img
                    src={authUser?.profilePhoto || "/default.png"}
                    alt="me"
                    className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                    <p className="font-semibold text-sm">{authUser?.fullName}</p>
                    <span className="text-green-500 text-xs">You</span>
                </div>
            </div>

            {/* 🔍 SEARCH */}
            <form onSubmit={searchSubmitHandler} className='flex items-center gap-2 mb-4'>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='flex-1 px-3 py-2 rounded-lg bg-white/70 backdrop-blur-md outline-none'
                    type="text"
                    placeholder='Search...'
                />

                <button type='submit' className='bg-zinc-700 text-white p-2 rounded-lg'>
                    <BiSearchAlt2 className='w-5 h-5' />
                </button>
            </form>

            {/* 👥 USER LIST */}
            <div className="flex-1 overflow-y-auto">
                <OtherUsers />
            </div>

            {/* 🚪 LOGOUT */}
            <div className='mt-4'>
                <button
                    onClick={logoutHandler}
                    className='w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600'
                >
                    Logout
                </button>
            </div>

        </div>
    )
}

export default Sidebar;