import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      seen: false,
      delivered: false
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const receiverSocketId = getReceiverSocketId(receiverId.toString());

    console.log("📡 Receiver socket:", receiverSocketId);

    //  DELIVERED UPDATE
    if (receiverSocketId) {
      await Message.findByIdAndUpdate(newMessage._id, {
        delivered: true
      });

      newMessage.delivered = true;
    }

    // 🔥 FINAL EMIT (IMPORTANT FIX)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("❌ Receiver offline → broadcasting");
      io.emit("newMessage", newMessage); // 🔥 fallback
    }

    // 🔥 sender ko bhi notify
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", {
        messageId: newMessage._id
      });
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.log(error);
  }
};

// GET MESSAGES
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    return res.status(200).json(conversation?.messages || []);
  } catch (error) {
    console.log(error);
  }
};

// MARK AS SEEN
export const markSeen = async (req, res) => {
  try {
    const senderId = req.params.id;
    const receiverId = req.id;

    await Message.updateMany(
      { senderId, receiverId, seen: false },
      { $set: { seen: true } }
    );

    const senderSocketId = getReceiverSocketId(senderId.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        senderId,
        receiverId
      });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.log(error);
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