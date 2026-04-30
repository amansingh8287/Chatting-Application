import express from "express";
import { getOtherUsers, login, logout, register } from "../controllers/usercontroller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { forgotPassword, resetPassword } from "../controllers/usercontroller.js";


const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/").get(isAuthenticated,getOtherUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;