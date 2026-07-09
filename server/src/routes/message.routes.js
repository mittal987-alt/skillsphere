import express from "express";

import {
  sendMessage,
  getMessages,
  deleteMessage,
  markSeen,
} from "../controllers/message.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Send Message
router.post("/", sendMessage);

// Get Messages of a Conversation
router.get("/:conversationId", getMessages);

// Delete Message
router.delete("/:id", deleteMessage);

// Mark Message as Seen
router.put("/:id/seen", markSeen);

export default router;