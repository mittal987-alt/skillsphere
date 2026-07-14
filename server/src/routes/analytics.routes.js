import express from "express";

import {
dashboardAnalytics,
monthlyRevenue,
monthlyUsers,
topFreelancers,
topClients,
topSkills
} from "../controllers/analytics.controller.js";

import {protect} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/role.middleware.js";

const router=express.Router();

router.use(
protect,
authorize("admin")
);

router.get("/dashboard",dashboardAnalytics);

router.get("/revenue",monthlyRevenue);

router.get("/users",monthlyUsers);

router.get("/top-freelancers",topFreelancers);

router.get("/top-clients",topClients);

router.get("/top-skills",topSkills);

export default router;