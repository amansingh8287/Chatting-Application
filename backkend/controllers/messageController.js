import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            seen: false // ✅ new field
        });

        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }

        await Promise.all([gotConversation.save(), newMessage.save()]);

        // 🔥 REALTIME
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({ newMessage });

    } catch (error) {
        console.log(error);
    }
};


// ✅ MARK AS SEEN
export const markSeen = async (req, res) => {
    try {
        const senderId = req.params.id;
        const receiverId = req.id;

        await Message.updateMany(
            { senderId, receiverId, seen: false },
            { $set: { seen: true } }
        );

        const senderSocketId = getReceiverSocketId(senderId);

        if (senderSocketId) {
            io.to(senderSocketId).emit("messageSeen");
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.log(error);
    }
};