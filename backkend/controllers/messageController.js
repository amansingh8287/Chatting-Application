import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// =======================
// ✅SEND MESSAGE (FINAL)
// =======================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    // find conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    //  create if not exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    //  create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      seen: false,
      delivered: false,
    });

    // save in conversation
    conversation.messages.push(newMessage._id);
    await conversation.save();

    //  socket ids
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    const senderSocketId = getReceiverSocketId(senderId.toString());

    console.log("📡 Receiver socket:", receiverSocketId);

    // =========================
    // DELIVERED UPDATE
    // =========================
    if (receiverSocketId) {
      await Message.findByIdAndUpdate(newMessage._id, {
        delivered: true,
      });
      newMessage.delivered = true;
    }

    // =========================
    //  REALTIME SEND
    // =========================

    // receiver ko bhejo
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // sender ko bhi bhejo (IMPORTANT)
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    // =========================
    // DELIVERED TICK
    // =========================
    if (receiverSocketId && senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", {
        messageId: newMessage._id,
      });
    }

    // =========================
    // RESPONSE
    // =========================
    res.status(201).json(newMessage);

  } catch (error) {
    console.log("❌ sendMessage error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE MESSAGE
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.message = "This message was deleted";
    message.deleted = true;

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", message);
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log(error);
  }
};
