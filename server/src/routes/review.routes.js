import express from "express";

import {
  createReview,
  updateReview,
  deleteReview,
  getFreelancerReviews,
  getGigReviews,
} from "../controllers/review.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Public Routes
router.get("/freelancer/:id", getFreelancerReviews);
router.get("/gig/:gigId", getGigReviews);

// Client Routes
router.post(
  "/",
  protect,
  authorize("client"),
  createReview
);

router.put(
  "/:id",
  protect,
  authorize("client"),
  updateReview
);

router.delete(
  "/:id",
  protect,
  authorize("client"),
  deleteReview
);

export default router;