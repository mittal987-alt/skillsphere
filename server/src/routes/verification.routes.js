import express from "express";
import {
  submitVerification,
  getVerificationStatus,
  getAllRequests,
  reviewRequest,
} from "../controllers/verification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/request", protect, submitVerification);
router.get("/status", protect, getVerificationStatus);
router.get("/admin/requests", protect, getAllRequests);
router.post("/admin/requests/:id/review", protect, reviewRequest);

export default router;
