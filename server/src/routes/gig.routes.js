import express from "express";

import {
  createGig,
  getAllGigs,
  getGigById,
  getMyGigs,
  updateGig,
  deleteGig,
} from "../controllers/gig.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// ---------- Public ----------
router.get("/", getAllGigs);

// ---------- Client ----------
router.get(
  "/my",
  protect,
  authorize("client"),
  getMyGigs
);

router.post(
  "/",
  protect,
  authorize("client"),
  createGig
);

router.put(
  "/:id",
  protect,
  authorize("client"),
  updateGig
);

router.delete(
  "/:id",
  protect,
  authorize("client"),
  deleteGig
);

// ---------- Public ----------
router.get("/:id", getGigById);

export default router;