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

    // Prevent deleting another admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete an admin account",
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
// Update User Role
// PUT /api/admin/users/:id/role
// ======================================

export const updateUserRole = async (req, res) => {

  try {

    const { role } = req.body;

    if (!["client", "freelancer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be client, freelancer, or admin",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent demoting yourself
    if (user._id.toString() === req.user._id.toString() && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
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
// Ban / Unban User
// PUT /api/admin/users/:id/ban
// ======================================

export const banUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot ban an admin account",
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned ? "User banned successfully" : "User unbanned successfully",
      isBanned: user.isBanned,
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
      .populate("gig", "title budget")
      .populate({
        path: "client",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "freelancer",
        populate: { path: "user", select: "name email" },
      })
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
      .populate("reviewer", "name email")
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


// ======================================
// Delete Review
// DELETE /api/admin/reviews/:id
// ======================================

export const deleteReview = async (req, res) => {

  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
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