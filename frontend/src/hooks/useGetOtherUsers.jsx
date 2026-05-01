import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUsers } from "../redux/userSlice";
import { BASE_URL } from "..";

const useGetOtherUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/user`, {
          withCredentials: true
        });

        console.log("API USERS:", res.data);

        dispatch(setUsers(res.data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, [dispatch]);
};

export default useGetOtherUsers;