import Review from "../models/Review.js";
import Client from "../models/client.js";
import Freelancer from "../models/Freelancer.js";
import Gig from "../models/Gig.js";
import Proposal from "../models/Proposal.js";
import Payment from "../models/payment.js";
import createNotification from "../utils/createNotification.js";
import reviewEmail from "../../templates/reviewEmail.js";
import { sendEmail } from "../services/email.service.js";

// ============================================
// Create Review
// POST /api/reviews
// Client
// ============================================

export const createReview = async (req, res) => {
  try {
    const { gigId, rating, review } = req.body;

    const client = await Client.findOne({
      user: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Allow review if gig is Completed OR has a Paid/Released payment OR completed milestones
    const payment = await Payment.findOne({
      gig: gigId,
      status: { $in: ["Paid", "Released"] },
    });

    const allMilestonesCompleted = gig.milestones && gig.milestones.length > 0
      ? gig.milestones.every(m => m.status === "Completed")
      : false;

    if (gig.status !== "Completed" && !payment && !allMilestonesCompleted) {
      return res.status(400).json({
        success: false,
        message: "Review can only be added after project completion or payment release",
      });
    }

    // Ensure gig status is set to Completed
    if (gig.status !== "Completed") {
      gig.status = "Completed";
      await gig.save();
    }

    const alreadyReviewed = await Review.findOne({
      gig: gigId,
      client: client._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this project",
      });
    }

    // Find proposal for this gig
    const proposal = await Proposal.findOne({
      gig: gigId,
      status: { $in: ["Accepted", "Approved", "Completed"] },
    });

    let freelancerId = proposal?.freelancer;

    // Fallback if proposal query didn't match: get freelancer from payment
    if (!freelancerId && payment) {
      freelancerId = payment.freelancer;
    }

    if (!freelancerId) {
      return res.status(404).json({
        success: false,
        message: "Associated freelancer profile not found for this gig",
      });
    }

    const freelancer = await Freelancer.findById(freelancerId).populate("user");

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
    }

    const newReview = await Review.create({
      gig: gigId,
      client: client._id,
      freelancer: freelancer._id,
      rating: Number(rating),
      review,
    });

    const reviews = await Review.find({
      freelancer: freelancer._id,
    });

    const totalSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalSum / reviews.length;

    freelancer.averageRating = Math.round(averageRating * 10) / 10;
    freelancer.totalReviews = reviews.length;

    await freelancer.save();

    try {
      if (freelancer?.user?.email) {
        await sendEmail({
          to: freelancer.user.email,
          subject: "New Review",
          html: reviewEmail(rating),
        });
      }
    } catch (emailError) {
      console.warn("Failed to send review email notification:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// Update Review
// ============================================

export const updateReview = async (req, res) => {

  try {

    const client = await Client.findOne({
      user: req.user._id,
    });

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.client.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    review.rating = req.body.rating || review.rating;
    review.review = req.body.review || review.review;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// Delete Review
// ============================================

export const deleteReview = async (req, res) => {

  try {

    const client = await Client.findOne({
      user: req.user._id,
    });

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.client.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// Freelancer Reviews
// ============================================

export const getFreelancerReviews = async (req, res) => {

  try {

    const reviews = await Review.find({
      freelancer: req.params.id,
    })
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// Gig Reviews
// ============================================

export const getGigReviews = async (req, res) => {

  try {

    const reviews = await Review.find({
      gig: req.params.gigId,
    })
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name",
        },
      });

    res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
