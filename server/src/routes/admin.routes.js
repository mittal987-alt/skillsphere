import express from "express";

import {
  dashboard,
  getUsers,
  getUser,
  deleteUser,
  verifyFreelancer,
  getGigs,
  deleteGig,
  getPayments,
  getReviews,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Protect all admin routes
router.use(
  protect,
  authorize("admin")
);

// Dashboard
router.get("/dashboard", dashboard);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.delete("/users/:id", deleteUser);

// Freelancers
router.put(
  "/freelancers/:id/verify",
  verifyFreelancer
);

// Gigs
router.get("/gigs", getGigs);
router.delete("/gigs/:id", deleteGig);

// Payments
router.get("/payments", getPayments);

// Reviews
router.get("/reviews", getReviews);

export default router;