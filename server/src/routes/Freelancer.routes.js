import express from "express";
import {
    createProfile,
    getMyProfile,
    updateProfile,
    getFreelancerById,
    deleteProfile
} from "../controllers/freelancer.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("freelancer"),
    createProfile
);

router.get(
    "/me",
    protect,
    authorize("freelancer"),
    getMyProfile
);

router.put(
    "/me",
    protect,
    authorize("freelancer"),
    updateProfile
);

router.delete(
    "/me",
    protect,
    authorize("freelancer"),
    deleteProfile
);

router.get("/:id", getFreelancerById);

export default router;