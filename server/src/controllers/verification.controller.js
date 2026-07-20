import VerificationRequest from "../models/VerificationRequest.js";
import Freelancer from "../models/Freelancer.js";
import createNotification from "../utils/createNotification.js";

// @desc    Submit verification request
// @route   POST /api/verification/request
// @access  Private (Freelancer)
export const submitVerification = async (req, res) => {
  try {
    const { resumeUrl, portfolioUrl, idCardNumber, idCardUrl } = req.body;

    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer profile not found" });
    }

    if (freelancer.verified) {
      return res.status(400).json({ success: false, message: "Freelancer is already verified" });
    }

    // Check if a pending request already exists
    const existing = await VerificationRequest.findOne({
      freelancer: freelancer._id,
      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "You already have a pending verification request" });
    }

    const request = await VerificationRequest.create({
      freelancer: freelancer._id,
      resumeUrl,
      portfolioUrl,
      idCardNumber,
      idCardUrl,
    });

    res.status(201).json({
      success: true,
      message: "Verification request submitted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get freelancer's verification status
// @route   GET /api/verification/status
// @access  Private (Freelancer)
export const getVerificationStatus = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer profile not found" });
    }

    const request = await VerificationRequest.findOne({ freelancer: freelancer._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      verified: freelancer.verified,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all verification requests (Admin only)
// @route   GET /api/verification/admin/requests
// @access  Private (Admin)
export const getAllRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const requests = await VerificationRequest.find()
      .populate({
        path: "freelancer",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review verification request (Admin only)
// @route   POST /api/verification/admin/requests/:id/review
// @access  Private (Admin)
export const reviewRequest = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body; // status: 'Approved' or 'Rejected'

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const request = await VerificationRequest.findById(req.params.id).populate("freelancer");
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Request has already been reviewed" });
    }

    request.status = status;
    request.rejectionReason = status === "Rejected" ? rejectionReason : "";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    const freelancer = await Freelancer.findById(request.freelancer._id).populate("user");

    if (status === "Approved") {
      freelancer.verified = true;
      await freelancer.save();

      if (freelancer.user) {
        await createNotification(
          freelancer.user._id,
          "Identity Verified ✅",
          "Congratulations! Your credentials have been verified by administrators. A verified badge has been added to your profile.",
          "system",
          "/freelancer/profile"
        );
      }
    } else {
      freelancer.verified = false;
      await freelancer.save();

      if (freelancer.user) {
        await createNotification(
          freelancer.user._id,
          "Verification Rejected ❌",
          `Your verification request was rejected. Reason: ${rejectionReason || "Incomplete credentials. Please submit valid files."}`,
          "system",
          "/freelancer/profile"
        );
      }
    }

    res.json({
      success: true,
      message: `Request reviewed successfully: ${status}`,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
