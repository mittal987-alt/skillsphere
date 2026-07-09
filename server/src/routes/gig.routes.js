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

// Public Routes
router.get("/", getAllGigs);
router.get("/:id", getGigById);

// Client Routes
router.post(
  "/",
  protect,
  authorize("client"),
  createGig
);

router.get(
  "/my",
  protect,
  authorize("client"),
  getMyGigs
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

export default router;