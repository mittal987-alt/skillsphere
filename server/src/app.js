import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import freelancerRoutes from "./routes/Freelancer.routes.js";
import clientRoutes from "./routes/client.routes.js";
import gigRoutes from "./routes/gig.routes.js";
import proposalRoutes from "./routes/proposal.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import searchRoutes from "./routes/search.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cloudinaryRoutes from "./routes/cloudinary.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/client", clientRoutes);
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