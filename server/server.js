import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/socket.js";

connectDB();

const server = http.createServer(app);

const io = initSocket(server);
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});