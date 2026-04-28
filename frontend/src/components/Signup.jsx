import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from '..';

const Signup = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // ✅ Password validation
    if (user.password !== user.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, user, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }

    setUser({
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      gender: "",
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-96 p-8 rounded-xl shadow-lg bg-black bg-opacity-50 backdrop-blur-md text-white">

        <h1 className="text-3xl font-bold text-center mb-6">Signup</h1>

        <form onSubmit={onSubmitHandler}>

          {/* Full Name */}
          <input
            value={user.fullName}
            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
            type="text"
            placeholder="Full Name"
          />

          {/* Username */}
          <input
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
            type="text"
            placeholder="Username"
          />

          {/* Password */}
          <input
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
            type="password"
            placeholder="Password"
          />

          {/* Confirm Password */}
          <input
            value={user.confirmPassword}
            onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
            className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
            type="password"
            placeholder="Confirm Password"
          />

          {/* ✅ Gender (FIXED) */}
          <div className="flex gap-6 my-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={user.gender === "male"}
                onChange={(e) => setUser({ ...user, gender: e.target.value })}
              />
              Male
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={user.gender === "female"}
                onChange={(e) => setUser({ ...user, gender: e.target.value })}
              />
              Female
            </label>
          </div>

          <p className="text-center mb-3">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded"
          >
            Signup
          </button>

        </form>
      </div>
    </div>
  );
};

export default Signup;