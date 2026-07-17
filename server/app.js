import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Missing");


import authRoutes from "./src/routes/auth.routes.js";
import freelancerRoutes from "./src/routes/Freelancer.routes.js";
import clientRoutes from "./src/routes/client.routes.js";
import gigRoutes from "./src/routes/gig.routes.js";
import proposalRoutes from "./src/routes/proposal.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import cloudinaryRoutes from "./src/routes/cloudinary.routes.js";
import messageRoutes from "./src/routes/message.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", cloudinaryRoutes);
app.use("/api/messages", messageRoutes);

export default app;