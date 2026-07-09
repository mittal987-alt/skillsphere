import Gig from "../models/Gig.js";
import Client from "../models/client.js";

// @desc Create Gig
// @route POST /api/gigs
// @access Private (Client)
export const createGig = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budget,
      deadline,
      experienceLevel,
      milestones,
      attachments,
    } = req.body;

    const client = await Client.findOne({ user: req.user._id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    const gig = await Gig.create({
      client: client._id,
      title,
      description,
      category,
      skills,
      budget,
      deadline,
      experienceLevel,
      milestones,
      attachments,
    });

    res.status(201).json({
      success: true,
      message: "Gig created successfully",
      gig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get All Gigs
// @route GET /api/gigs
// @access Public
export const getAllGigs = async (req, res) => {
  try {
    const {
      category,
      skill,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const query = {
      status: "Open",
    };

    if (category) {
      query.category = category;
    }

    if (skill) {
      query.skills = { $in: [skill] };
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (minBudget || maxBudget) {
      query.budget = {};

      if (minBudget) query.budget.$gte = Number(minBudget);

      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    const gigs = await Gig.find(query)
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Gig.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      gigs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get Single Gig
// @route GET /api/gigs/:id
// @access Public
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate({
      path: "client",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    res.status(200).json({
      success: true,
      gig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get My Gigs
// @route GET /api/gigs/my
// @access Private (Client)
export const getMyGigs = async (req, res) => {
  try {
    const client = await Client.findOne({ user: req.user._id });

    const gigs = await Gig.find({
      client: client._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      gigs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update Gig
// @route PUT /api/gigs/:id
// @access Private (Client)
export const updateGig = async (req, res) => {
  try {
    const client = await Client.findOne({
      user: req.user._id,
    });

    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    if (gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Gig updated successfully",
      gig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete Gig
// @route DELETE /api/gigs/:id
// @access Private (Client)
export const deleteGig = async (req, res) => {
  try {
    const client = await Client.findOne({
      user: req.user._id,
    });

    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    if (gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
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