import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "..";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      return toast.error("Please enter username");
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/user/forgot-password`,
        { username }
      );

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Send Reset Link
        </button>

         <p
          onClick={() => navigate("/login")}
          className="text-center text-blue-500 mt-3 cursor-pointer hover:underline"
        >
          Back to Login
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;