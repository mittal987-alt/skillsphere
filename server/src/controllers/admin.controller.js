import User from "../models/User.js";
import Client from "../models/Client.js";
import Freelancer from "../models/Freelancer.js";
import Gig from "../models/Gig.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";


// ======================================
// Dashboard Analytics
// GET /api/admin/dashboard
// ======================================

export const dashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const clients = await Client.countDocuments();
    const freelancers = await Freelancer.countDocuments();
    const gigs = await Gig.countDocuments();
    const payments = await Payment.countDocuments();
    const reviews = await Review.countDocuments();

    const revenueData = await Payment.find({
      status: "Paid",
    });

    const revenue = revenueData.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    res.status(200).json({
      success: true,
      dashboard: {
        users,
        clients,
        freelancers,
        gigs,
        payments,
        reviews,
        revenue,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Get All Users
// GET /api/admin/users
// ======================================

export const getUsers = async (req, res) => {

  try {

    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Get Single User
// GET /api/admin/users/:id
// ======================================

export const getUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Delete User
// DELETE /api/admin/users/:id
// ======================================

export const deleteUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Verify Freelancer
// PUT /api/admin/freelancers/:id/verify
// ======================================

export const verifyFreelancer = async (req, res) => {

  try {

    const freelancer = await Freelancer.findById(req.params.id);

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }

    freelancer.verified = true;

    await freelancer.save();

    res.status(200).json({
      success: true,
      message: "Freelancer verified successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Get All Gigs
// GET /api/admin/gigs
// ======================================

export const getGigs = async (req, res) => {

  try {

    const gigs = await Gig.find()
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Delete Gig
// DELETE /api/admin/gigs/:id
// ======================================

export const deleteGig = async (req, res) => {

  try {

    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Get All Payments
// GET /api/admin/payments
// ======================================

export const getPayments = async (req, res) => {

  try {

    const payments = await Payment.find()
      .populate("gig", "title")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Get All Reviews
// GET /api/admin/reviews
// ======================================

export const getReviews = async (req, res) => {

  try {

    const reviews = await Review.find()
      .populate("gig", "title")
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