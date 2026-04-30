import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

//  SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    //  STEP 1: message create
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      seen: false,
      delivered: false
    });

    //  STEP 2: YAHAN YE CODE LAGANA HAI 
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      await Message.findByIdAndUpdate(newMessage._id, {
        delivered: true
      });

      newMessage.delivered = true;

      io.to(receiverSocketId).emit("newMessage", newMessage);

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: newMessage._id
        });
      }
    }

    //  STEP 3: response
    res.status(201).json(newMessage);

  } catch (error) {
    console.log(error);
  }
};

//  GET MESSAGES ( THIS WAS MISSING)
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

// ✅ MARK AS SEEN
export const markSeen = async (req, res) => {
    try {
        const senderId = req.params.id;
        const receiverId = req.id;

        //  update DB
        const updatedMessages = await Message.updateMany(
            { senderId, receiverId, seen: false },
            { $set: { seen: true } }
        );

        const senderSocketId = getReceiverSocketId(senderId);

        // IMPORTANT CHANGE (payload bhejo)
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

export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    //  WhatsApp style delete
    message.message = "This message was deleted";
    message.deleted = true;

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", message);
    }

    res.json({ success: true, message });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
