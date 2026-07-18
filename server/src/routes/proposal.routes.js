import express from "express";

import {
  submitProposal,
  getMyProposals,
  getGigProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
} from "../controllers/proposal.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Freelancer Routes
router.post(
  "/",
  protect,
  authorize("freelancer"),
  submitProposal
);

router.get(
  "/my",
  protect,
  authorize("freelancer"),
  getMyProposals
);
router.put(
    "/:id/complete",
    protect,
    authorize("freelancer"),
    completeJob
);

router.put(
    "/:id/approve",
    protect,
    authorize("client"),
    approveJob
);

router.delete(
  "/:id",
  protect,
  authorize("freelancer"),
  withdrawProposal
);

// Client Routes
router.get(
  "/gig/:gigId",
  protect,
  authorize("client"),
  getGigProposals
);

router.put(
  "/:id/accept",
  protect,
  authorize("client"),
  acceptProposal
);

router.put(
  "/:id/reject",
  protect,
  authorize("client"),
  rejectProposal
);

export default router;