import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// @desc Get All Conversations
// @route GET /api/chat
// @access Private

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { client: req.user._id },
        { freelancer: req.user._id },
      ],
    })
      .populate("client", "name email avatar")
      .populate("freelancer", "name email avatar")
      .populate("gig", "title")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get Messages
// @route GET /api/chat/:conversationId
// @access Private

export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.client.toString() === req.user._id.toString() ||
      conversation.freelancer.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Send Message
// @route POST /api/chat/send
// @access Private

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, attachments } = req.body;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.client.toString() === req.user._id.toString() ||
      conversation.freelancer.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      message,
      attachments,
    });

    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();

    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Mark Message Seen
// @route PUT /api/chat/:messageId/seen
// @access Private

export const markSeen = async (req, res) => {
  try {
    const message = await Message.findById(
      req.params.messageId
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.seen = true;

    await message.save();

    res.status(200).json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};