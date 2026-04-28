// import { User } from "../models/usermodel.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const register = async (req, res) => {
//     try {
//         const { fullName, username, password, confirmPassword, gender } = req.body;
//         if (!fullName || !username || !password || !confirmPassword || !gender) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         if (password !== confirmPassword) {
//             return res.status(400).json({ message: "Password do not match" });
//         }

//         const user = await User.findOne({ username });
//         if (user) {
//             return res.status(400).json({ message: "Username already exit try different" });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // profilePhoto
//         // const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
//         // const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;
//         const avatar = gender === "male"
//           ? `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
//           : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`;
        

//         await User.create({
//             fullName,
//             username,
//             password: hashedPassword,
//             profilePhoto: avatar,
//             gender
//         });
//         return res.status(201).json({
//             message: "Account created successfully.",
//             success: true
//         })
//     } catch (error) {
//         console.log(error);
//     }
// };
// export const login = async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         if (!username || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         };
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(400).json({
//                 message: "Incorrect username or password",
//                 success: false
//             })
//         };
//         const isPasswordMatch = await bcrypt.compare(password, user.password);
//         if (!isPasswordMatch) {
//             return res.status(400).json({
//                 message: "Incorrect username or password",
//                 success: false
//             })
//         };
//         const tokenData = {
//             userId: user._id
//         };

//         const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

//         return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
//             _id: user._id,
//             username: user.username,
//             fullName: user.fullName,
//             profilePhoto: user.profilePhoto
//         });

//     } catch (error) {
//         console.log(error);
//     }
// }
// export const logout = (req, res) => {
//     try {
//         return res.status(200).cookie("token", "", { maxAge: 0 }).json({
//             message: "logged out successfully."
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }
// export const getOtherUsers = async (req, res) => {
//     try {
//         const loggedInUserId = req.id;
//         const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
//         return res.status(200).json(otherUsers);
//     } catch (error) {
//         console.log(error);
//     }
// }

import { User } from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ REGISTER
export const register = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (!fullName || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Avatar (working)
        const avatar = gender === "male"
            ? `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
            : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`;

        await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto: avatar,
            gender
        });

        return res.status(201).json({
            message: "Account created successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ✅ LOGIN (🔥 FIXED)
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect username or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // ✅ 🔥 IMPORTANT COOKIE FIX
        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: true,        // required for production
                sameSite: "None",    // 🔥 FIX for Vercel + Render
                maxAge: 24 * 60 * 60 * 1000
            })
            .json({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                profilePhoto: user.profilePhoto
            });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ✅ LOGOUT
export const logout = (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", "", {
                maxAge: 0
            })
            .json({ message: "Logged out successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ✅ GET OTHER USERS
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;

        const users = await User.find({
            _id: { $ne: loggedInUserId }
        }).select("-password");

        return res.status(200).json(users);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};