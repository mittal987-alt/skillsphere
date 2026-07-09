import Freelancer from "../models/Freelancer.js";

// @desc    Create Freelancer Profile
// @route   POST /api/freelancers
// @access  Private/Freelancer
export const createProfile = async (req, res) => {
  try {
    const existingProfile = await Freelancer.findOne({ user: req.user._id });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
      });
    }

    const profileData = { ...req.body, user: req.user._id };

    const freelancer = await Freelancer.create(profileData);

    res.status(201).json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Current Freelancer Profile
// @route   GET /api/freelancers/me
// @access  Private/Freelancer
export const getMyProfile = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id }).populate("user", "name email avatar");

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update Freelancer Profile
// @route   PUT /api/freelancers/me
// @access  Private/Freelancer
export const updateProfile = async (req, res) => {
  try {
    let freelancer = await Freelancer.findOne({ user: req.user._id });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    freelancer = await Freelancer.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete Freelancer Profile
// @route   DELETE /api/freelancers/me
// @access  Private/Freelancer
export const deleteProfile = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    await freelancer.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: "Profile deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Freelancer by ID
// @route   GET /api/freelancers/:id
// @access  Public
export const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate("user", "name email avatar");

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
