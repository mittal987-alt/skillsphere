import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./src/config/db.js";

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Make io available everywhere
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinChat", (conversationId) => {
    socket.join(conversationId);
    console.log("Joined:", conversationId);
  });

  socket.on("leaveChat", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});