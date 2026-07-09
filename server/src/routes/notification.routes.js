import express from "express";

import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from "../controllers/notification.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Get Notifications
router.get("/", getMyNotifications);

// Mark One Read
router.put("/:id/read", markAsRead);

// Mark All Read
router.put("/read-all", markAllAsRead);

// Delete Notification
router.delete("/:id", deleteNotification);

export default router;