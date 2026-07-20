import Notification from "../models/Notification.js";

/**
 * Creates a notification in the database and emits it via Socket.IO if the user is connected.
 * 
 * @param {Object} req - The Express request object (must have req.app.get("io") available)
 * @param {String} userId - The ID of the user receiving the notification
 * @param {String} title - The title of the notification
 * @param {String} message - The notification message
 * @param {String} type - The type of notification (e.g., 'gig', 'proposal', 'payment', 'system')
 * @param {String} [link] - Optional URL link for the notification
 */
export const createAndEmitNotification = async (req, userId, title, message, type = "system", link = "") => {
  try {
    // 1. Save to database
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      isRead: false,
    });

    // 2. Emit via Socket.IO
    const io = req.app.get("io");
    if (io) {
      // Emit to the specific user's room
      io.to(userId.toString()).emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating/emitting notification:", error);
    // Don't throw, just log it so it doesn't break the main flow
  }
};
