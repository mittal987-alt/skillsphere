import Gig from "../models/Gig.js";
import Freelancer from "../models/Freelancer.js";
import calculateScore from "../services/aiMatching.service.js";

export const recommendFreelancers = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    const freelancers = await Freelancer.find();

    const recommendations = freelancers
      .map((freelancer) => ({
        freelancer,
        score: calculateScore(gig, freelancer),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};