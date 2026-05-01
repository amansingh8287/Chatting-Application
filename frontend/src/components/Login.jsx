import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '..';

// icons
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = () => {

  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/user/login`,
        user,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      console.log("LOGIN RESPONSE:", res.data);

      // correct user extract
      const loggedInUser = res.data.user || res.data;

      // safety check
      if (!loggedInUser?._id) {
        toast.error("Login failed: invalid user data");
        return;
      }

      //  redux save
      dispatch(setAuthUser(loggedInUser));

      // localStorage save (VERY IMPORTANT)
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      toast.success("Login successful ✅");

      // redirect
      navigate("/");

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed ❌");
    }

    setUser({
      username: "",
      password: ""
    });
  }

  return (
    <div className="min-w-96 mx-auto">
      <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100'>

        <h1 className='text-3xl font-bold text-center'>Login</h1>

        <form onSubmit={onSubmitHandler}>

          {/* USERNAME */}
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Username</span>
            </label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className='w-full input input-bordered h-10'
              type="text"
              placeholder='Username'
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Password</span>
            </label>

            <div className="relative w-full">
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className='w-full input input-bordered h-10 pr-10'
                type={showPassword ? "text" : "password"}
                placeholder='Password'
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-xl"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          {/* FORGOT PASSWORD */}
          <p className='text-right text-sm mt-1'>
            <span
              onClick={() => navigate("/forgot-password")}
              className='text-blue-500 cursor-pointer hover:underline'
            >
              Forgot Password?
            </span>
          </p>

          {/* SIGNUP */}
          <p className='text-center my-2'>
            Don't have an account? <Link to="/signup">signup</Link>
          </p>

          {/* BUTTON */}
          <div>
            <button
              type="submit"
              className='btn btn-block btn-sm mt-2 border border-slate-700'
            >
              Login
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Login;