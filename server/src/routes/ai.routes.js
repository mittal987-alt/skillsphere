import express from "express";
import { recommendFreelancers } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Client: Get AI recommendations for a gig
router.get(
  "/recommend/:gigId",
  protect,
  authorize("client"),
  recommendFreelancers
);

export default router;