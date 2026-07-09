import express from "express";

import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getFreelancerPayments,
  getAllPayments,
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// =========================
// Client Routes
// =========================

// Create Razorpay Order
router.post(
  "/create-order",
  protect,
  authorize("client"),
  createOrder
);

// Verify Razorpay Payment
router.post(
  "/verify",
  protect,
  authorize("client"),
  verifyPayment
);

// Client Payment History
router.get(
  "/my",
  protect,
  authorize("client"),
  getMyPayments
);

// =========================
// Freelancer Routes
// =========================

// Freelancer Earnings
router.get(
  "/freelancer",
  protect,
  authorize("freelancer"),
  getFreelancerPayments
);

// =========================
// Admin Routes
// =========================

// All Payments
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllPayments
);

export default router;