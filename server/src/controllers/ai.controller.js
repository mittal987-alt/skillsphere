import Gig from "../models/Gig.js";
import Freelancer from "../models/Freelancer.js";
import {
  rankFreelancersWithAI,
  rankGigsForFreelancerWithAI,
  calculateDeterministicScore,
} from "../services/aiMatching.service.js";

// @desc    AI-recommend top freelancers for a gig (Client use)
// @route   GET /api/ai/recommend/:gigId
// @access  Private (Client)
export const recommendFreelancers = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    const freelancers = await Freelancer.find({ availability: { $ne: "Offline" } })
      .populate("user", "name avatar")
      .limit(30);

    let recommendations;
    try {
      recommendations = await rankFreelancersWithAI(gig, freelancers);
    } catch (aiError) {
      console.warn("Mistral AI call failed, falling back to deterministic scoring:", aiError.message);
      recommendations = freelancers
        .map((f) => ({
          freelancer: f,
          score: calculateDeterministicScore(gig, f),
          reason: "Matched based on skill overlap and experience.",
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    }

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI-recommend top gigs for a freelancer
// @route   GET /api/ai/gig-recommendations
// @access  Private (Freelancer)
export const recommendGigs = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer profile not found" });
    }

    const openGigs = await Gig.find({ status: "Open" })
      .populate("client", "name")
      .sort({ createdAt: -1 })
      .limit(30);

    if (openGigs.length === 0) {
      return res.json({ success: true, recommendations: [] });
    }

    let recommendations;
    try {
      recommendations = await rankGigsForFreelancerWithAI(freelancer, openGigs);
    } catch (aiError) {
      console.warn("Mistral AI call failed, falling back to deterministic scoring:", aiError.message);
      recommendations = openGigs
        .map((g) => ({
          gig: g,
          score: calculateDeterministicScore(g, freelancer),
          reason: "Matched based on your skills and gig requirements.",
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    }

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};