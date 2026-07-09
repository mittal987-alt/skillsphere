import express from "express";

import {
  getConversations,
  getMessages,
  sendMessage,
  markSeen,
} from "../controllers/chat.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Get all conversations
router.get("/", getConversations);

// Get messages of a conversation
router.get("/:conversationId", getMessages);

// Send message
router.post("/send", sendMessage);

// Mark message as seen
router.put("/:messageId/seen", markSeen);

export default router;