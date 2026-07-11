import express from "express";

import{
searchGigs,
searchFreelancers
}from "../controllers/search.controller.js";

const router=express.Router();

router.get("/gigs",searchGigs);

router.get("/freelancers",searchFreelancers);

export default router;