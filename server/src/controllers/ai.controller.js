import Gig from "../models/Gig.js";
import Freelancer from "../models/Freelancer.js";
import {
  rankFreelancersWithAI,
  rankGigsForFreelancerWithAI,
  calculateDeterministicScore,
  generateAICoverLetter,
  enhanceGigDescription,
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
      .populate("user", "name avatar email")
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
          reason: "Matched based on skill overlap and experience level.",
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
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
      .populate({ path: "client", populate: { path: "user", select: "name" } })
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
        .slice(0, 10);
    }

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate AI Proposal / Cover Letter for Freelancer
// @route   POST /api/ai/generate-cover-letter
// @access  Private (Freelancer)
export const generateCoverLetter = async (req, res) => {
  try {
    const { gigId } = req.body;
    if (!gigId) {
      return res.status(400).json({ success: false, message: "gigId is required" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer profile not found" });
    }

    const coverLetter = await generateAICoverLetter(gig, freelancer);

    res.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enhance Gig Description & Extract Skills for Client
// @route   POST /api/ai/enhance-gig-description
// @access  Private (Client)
export const enhanceGig = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const result = await enhanceGigDescription(title, description, category);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};