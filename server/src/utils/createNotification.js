import Notification from "../models/Notification.js";

const createNotification = async (
  user,
  title,
  message,
  type = "System",
  link = ""
) => {

  return await Notification.create({
    user,
    title,
    message,
    type,
    link,
  });

};

export default createNotification;