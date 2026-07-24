import jwt from "jsonwebtoken";
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    const jwtSecret = process.env.JWT_SECRET || "dev_secret";

    if (!token) {
      console.log("Socket connection rejected: missing token");
      socket.disconnect();
      return;
    }

    try {
      jwt.verify(token, jwtSecret);
    } catch (error) {
      console.log("Socket auth failed:", error.message);
      socket.disconnect();
      return;
    }

    console.log("User Connected:", socket.id);

    // Users can join their personal room for notifications
    socket.on("joinNotificationRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on("joinChat", (conversationId) => {
      socket.join(conversationId);
      console.log("Joined:", conversationId);
    });

    socket.on("leaveChat", (conversationId) => {
      socket.leave(conversationId);
    });

    // --- WebRTC Video Calling Signaling ---
    
    socket.on("joinVideoRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined video room: ${roomId}`);
      // Notify others in the room that someone joined
      socket.to(roomId).emit("user-joined-video", socket.id);
    });

    socket.on("leaveVideoRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left video room: ${roomId}`);
      socket.to(roomId).emit("user-left-video", socket.id);
    });

    socket.on("video-offer", ({ offer, to }) => {
      socket.to(to).emit("video-offer", { offer, from: socket.id });
    });

    socket.on("video-answer", ({ answer, to }) => {
      socket.to(to).emit("video-answer", { answer, from: socket.id });
    });

    socket.on("new-ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("new-ice-candidate", { candidate, from: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      // Optional: Broadcast a generic disconnect if needed for cleanup in rooms
      socket.broadcast.emit("user-disconnected", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
