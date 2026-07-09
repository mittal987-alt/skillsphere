import Client from "../models/client.js";

// @desc    Create Client Profile
// @route   POST /api/clients
// @access  Private/Client
export const createProfile = async (req, res) => {
  try {
    const existingProfile = await Client.findOne({ user: req.user._id });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
      });
    }

    const profileData = { ...req.body, user: req.user._id };

    const client = await Client.create(profileData);

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Current Client Profile
// @route   GET /api/clients/me
// @access  Private/Client
export const getMyProfile = async (req, res) => {
  try {
    const client = await Client.findOne({ user: req.user._id }).populate("user", "name email avatar");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update Client Profile
// @route   PUT /api/clients/me
// @access  Private/Client
export const updateProfile = async (req, res) => {
  try {
    let client = await Client.findOne({ user: req.user._id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    client = await Client.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete Client Profile
// @route   DELETE /api/clients/me
// @access  Private/Client
export const deleteProfile = async (req, res) => {
  try {
    const client = await Client.findOne({ user: req.user._id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    await client.deleteOne();

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

// @desc    Get Client by ID
// @route   GET /api/clients/:id
// @access  Public
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate("user", "name email avatar");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
