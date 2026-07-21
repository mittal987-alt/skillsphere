import User from "../models/User.js";
import Client from "../models/Client.js";
import Freelancer from "../models/Freelancer.js";
import Gig from "../models/Gig.js";
import Proposal from "../models/Proposal.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";

// ======================================
// Dashboard Analytics
// GET /api/analytics/dashboard
// ======================================

export const dashboardAnalytics = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const clients = await Client.countDocuments();
    const freelancers = await Freelancer.countDocuments();
    const gigs = await Gig.countDocuments();
    const proposals = await Proposal.countDocuments();

    const completedProjects = await Gig.countDocuments({
      status: "Completed",
    });

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const ratings = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        users,
        clients,
        freelancers,
        gigs,
        proposals,
        completedProjects,
        revenue: revenue.length ? revenue[0].totalRevenue : 0,
        averageRating: ratings.length
          ? Number(ratings[0].averageRating.toFixed(2))
          : 0,
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
// Monthly Revenue
// GET /api/analytics/revenue
// ======================================

export const monthlyRevenue = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "Paid",
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          revenue: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      revenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Monthly User Registrations
// GET /api/analytics/users
// ======================================

export const monthlyUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
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
// Top Rated Freelancers
// GET /api/analytics/top-freelancers
// ======================================

export const topFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find()
      .populate("user", "name email")
      .sort({
        averageRating: -1,
        totalReviews: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      freelancers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Top Clients
// GET /api/analytics/top-clients
// ======================================

export const topClients = async (req, res) => {
  try {
    const clients = await Gig.aggregate([
      {
        $group: {
          _id: "$client",
          totalProjects: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalProjects: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $unwind: "$client",
      },
      {
        $lookup: {
          from: "users",
          localField: "client.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          totalProjects: 1,
          name: "$user.name",
          email: "$user.email",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Most Popular Skills
// GET /api/analytics/top-skills
// ======================================

export const topSkills = async (req, res) => {
  try {
    const skills = await Freelancer.aggregate([
      {
        $unwind: "$skills",
      },
      {
        $group: {
          _id: "$skills",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 15,
      },
    ]);

    res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Platform Statistics
// GET /api/analytics/platform
// ======================================

export const platformStatistics = async (req, res) => {
  try {
    const openGigs = await Gig.countDocuments({
      status: "Open",
    });

    const inProgress = await Gig.countDocuments({
      status: "In Progress",
    });

    const completed = await Gig.countDocuments({
      status: "Completed",
    });

    const cancelled = await Gig.countDocuments({
      status: "Cancelled",
    });

    const pendingPayments = await Payment.countDocuments({
      status: "Pending",
    });

    const successfulPayments = await Payment.countDocuments({
      status: "Paid",
    });

    res.status(200).json({
      success: true,
      statistics: {
        openGigs,
        inProgress,
        completed,
        cancelled,
        pendingPayments,
        successfulPayments,
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
// Monthly Reviews
// GET /api/analytics/reviews
// ======================================

export const monthlyReviews = async (req, res) => {
  try {
    const reviews = await Review.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};