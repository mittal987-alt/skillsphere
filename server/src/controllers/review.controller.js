import Review from "../models/Review.js";
import Client from "../models/Client.js";
import Freelancer from "../models/Freelancer.js";
import Gig from "../models/Gig.js";
import createNotification from "../utils/createNotification.js";

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

    if (gig.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Review can only be added after project completion",
      });
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

    const proposal = await Proposal.findOne({
      gig: gigId,
      status: "Accepted",
    });

    const freelancer = await Freelancer.findById(
      proposal.freelancer
    ).populate("user");

    const newReview = await Review.create({
      gig: gigId,
      client: client._id,
      freelancer: freelancer._id,
      rating,
      review,
    });

    const reviews = await Review.find({
      freelancer: freelancer._id,
    });

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      reviews.length;

    freelancer.averageRating = averageRating;
    freelancer.totalReviews = reviews.length;

    await freelancer.save();

    await createNotification(
      freelancer.user._id,
      "New Review",
      "A client has left you a review.",
      "Review",
      "/freelancer/reviews"
    );

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