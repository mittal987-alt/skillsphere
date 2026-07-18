import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// @desc Send Message
// @route POST /api/messages
// @access Private

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, attachments } = req.body;

    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Message or attachment is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);

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

    const io = req.app.get("io");

io.to(conversationId).emit("newMessage", populatedMessage);
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Get Messages
// @route GET /api/messages/:conversationId
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
      count: messages.length,
      messages,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Delete Message
// @route DELETE /api/messages/:id
// @access Private

export const deleteMessage = async (req, res) => {

  try {

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Mark Message Seen
// @route PUT /api/messages/:id/seen
// @access Private

export const markSeen = async (req, res) => {

  try {

    const message = await Message.findById(req.params.id);

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