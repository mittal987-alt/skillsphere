import express from "express";
import {
  recommendFreelancers,
  recommendGigs,
  generateCoverLetter,
  enhanceGig,
  aiStatus,
} from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Client: Get AI recommendations for a gig
router.get("/recommend/:gigId", protect, authorize("client"), recommendFreelancers);

// Public status check for Mistral configuration
router.get("/status", aiStatus);

// Freelancer: Get AI-recommended gigs based on profile
router.get("/gig-recommendations", protect, authorize("freelancer"), recommendGigs);

// Freelancer: Generate AI Cover Letter / Proposal text
router.post("/generate-cover-letter", protect, authorize("freelancer"), generateCoverLetter);

// Client: Enhance Gig description & recommend skill tags
router.post("/enhance-gig-description", protect, authorize("client"), enhanceGig);

export default router;