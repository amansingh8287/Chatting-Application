import express from "express";
import { getMessage, sendMessage } from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { deleteMessage, markSeen } from "../controllers/messageController.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated,sendMessage);
router.route("/:id").get(isAuthenticated, getMessage);
router.route("/seen/:id").put(isAuthenticated, markSeen);
router.route("/:id").delete(isAuthenticated, deleteMessage);

// router.post("/send/:id", isAuthenticated, sendMessage);
// router.get("/:id", isAuthenticated, getMessage);

export default router;