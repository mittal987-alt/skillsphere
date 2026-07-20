import Freelancer from "../models/Freelancer.js";
import Payment from "../models/Payment.js";
import Proposal from "../models/Proposal.js";
import Review from "../models/Review.js";

// @desc    Get Freelancer Analytics Dashboard Data
// @route   GET /api/freelancers/analytics/dashboard
// @access  Private/Freelancer
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
    }

    const freelancerId = freelancer._id;

    // 1. Get profile views
    const profileViews = freelancer.profileViews || 0;

    // 2. Get active applications (Proposals that are not Rejected or Withdrawn)
    const activeApplicationsCount = await Proposal.countDocuments({
      freelancer: freelancerId,
      status: { $in: ["Pending", "Accepted", "Approved", "Completed"] },
    });
    
    // Total applications for success rate
    const totalApplicationsCount = await Proposal.countDocuments({
      freelancer: freelancerId
    });

    // 3. Get earnings statistics
    const payments = await Payment.find({
      freelancer: freelancerId,
      status: "Paid",
    });

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.freelancerAmount, 0);

    // 4. Monthly revenue chart data (aggregate by month)
    const monthlyRevenueRaw = await Payment.aggregate([
      {
        $match: {
          freelancer: freelancerId,
          status: "Paid",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$freelancerAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Fill in missing months for the last 6 months
    const today = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last6Months.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        monthName: d.toLocaleString('default', { month: 'short' }),
        revenue: 0
      });
    }

    monthlyRevenueRaw.forEach(item => {
      const match = last6Months.find(m => m.month === item._id.month && m.year === item._id.year);
      if (match) {
        match.revenue = item.revenue;
      }
    });

    // 5. Client feedback analytics
    const reviews = await Review.find({ freelancer: freelancerId }).populate("client", "user companyName");
    
    const feedbackDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    reviews.forEach(review => {
      feedbackDistribution[review.rating] = (feedbackDistribution[review.rating] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          profileViews,
          activeApplications: activeApplicationsCount,
          totalApplications: totalApplicationsCount,
          totalEarnings,
          averageRating: freelancer.averageRating,
          totalReviews: freelancer.totalReviews
        },
        monthlyRevenue: last6Months,
        feedback: {
          distribution: feedbackDistribution,
          recentReviews: reviews.slice(0, 5) // Send top 5 most recent
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
