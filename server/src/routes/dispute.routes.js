import express from "express";
import {
  fileDispute,
  submitEvidence,
  resolveDispute,
  getDisputes,
} from "../controllers/dispute.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getDisputes);
router.post("/", protect, fileDispute);
router.post("/:id/evidence", protect, submitEvidence);
router.post("/:id/resolve", protect, resolveDispute);

export default router;
