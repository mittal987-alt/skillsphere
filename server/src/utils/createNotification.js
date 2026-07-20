import Notification from "../models/Notification.js";
import { getIO } from "../socket.js";

const createNotification = async (
  user,
  title,
  message,
  type = "System",
  link = ""
) => {

  const notification = await Notification.create({
    user,
    title,
    message,
    type,
    link,
  });

  try {
    const io = getIO();
    io.to(user.toString()).emit("newNotification", notification);
  } catch (error) {
    console.error("Socket emit failed (socket not initialized or user not connected):", error.message);
  }

  return notification;
};

export default createNotification;