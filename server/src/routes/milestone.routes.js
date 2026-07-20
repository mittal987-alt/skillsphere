import express from "express";
import {
  fundMilestone,
  submitMilestone,
  approveMilestone,
  rejectMilestone,
} from "../controllers/milestone.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:gigId/:milestoneId/fund", protect, fundMilestone);
router.post("/:gigId/:milestoneId/submit", protect, submitMilestone);
router.post("/:gigId/:milestoneId/approve", protect, approveMilestone);
router.post("/:gigId/:milestoneId/reject", protect, rejectMilestone);

export default router;
