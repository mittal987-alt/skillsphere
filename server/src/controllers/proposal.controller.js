import Proposal from "../models/Proposal.js";
import Freelancer from "../models/Freelancer.js";
import Gig from "../models/Gig.js";
import Client from "../models/client.js";
import Conversation from "../models/Conversation.js";
import createNotification from "../utils/createNotification.js";
import { sendEmail } from "../services/email.service.js";
import proposalEmail from "../../templates/proposalEmail.js";

// @desc Submit Proposal
// @route POST /api/proposals
// @access Private (Freelancer)
export const submitProposal = async (req, res) => {
  try {
    const { gigId, coverLetter, bidAmount, estimatedDays } = req.body;

    const freelancer = await Freelancer.findOne({
      user: req.user._id,
    });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
    }

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    if (gig.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "This gig is no longer accepting proposals",
      });
    }

    const alreadyApplied = await Proposal.findOne({
      gig: gigId,
      freelancer: freelancer._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this gig",
      });
    }

    const proposal = await Proposal.create({
  gig: gigId,
  freelancer: freelancer._id,
  coverLetter,
  bidAmount,
  estimatedDays,
});

const client = await Client.findById(gig.client).populate("user");

await createNotification(
  client.user._id,
  "New Proposal",
  `${req.user.name} submitted a proposal for "${gig.title}".`,
  "Proposal",
  `/client/gigs/${gig._id}`
);
await sendEmail({
  to: client.user.email,
  subject: "New Proposal Received",
  html: proposalEmail(gig.title),
});

res.status(201).json({
    success: true,
    message: "Proposal submitted successfully",
    proposal,
  });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get My Proposals
// @route GET /api/proposals/my
// @access Private (Freelancer)
export const getMyProposals = async (req, res) => {
  try {

    const freelancer = await Freelancer.findOne({
      user: req.user._id,
    });

    const proposals = await Proposal.find({
      freelancer: freelancer._id,
    })
      .populate("gig")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      proposals,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Get All Proposals of a Gig
// @route GET /api/proposals/gig/:gigId
// @access Private (Client)
export const getGigProposals = async (req, res) => {

  try {

    const client = await Client.findOne({
      user: req.user._id,
    });

    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    if (gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const proposals = await Proposal.find({
      gig: gig._id,
    })
      .populate({
        path: "freelancer",
      })
      .sort({
        bidAmount: 1,
      });

    res.status(200).json({
      success: true,
      proposals,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Accept Proposal
// @route PUT /api/proposals/:id/accept
// @access Private (Client)
export const acceptProposal = async (req, res) => {

  try {

    const client = await Client.findOne({
      user: req.user._id,
    });

    const proposal = await Proposal.findById(req.params.id).populate("gig");

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    if (proposal.gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    proposal.status = "Accepted";
    await proposal.save();
    const freelancer = await Freelancer.findById(
  proposal.freelancer
).populate("user");

await createNotification(
  freelancer.user._id,
  "Proposal Accepted",
  `Congratulations! Your proposal for "${proposal.gig.title}" has been accepted.`,
  "Proposal",
  "/freelancer/proposals"
);

// Create chat conversation automatically
await Conversation.findOneAndUpdate(
  {
    gig: proposal.gig._id,
    client: client.user,
    freelancer: freelancer.user._id,
  },
  {
    gig: proposal.gig._id,
    client: client.user,
    freelancer: freelancer.user._id,
  },
  {
    upsert: true,
    new: true,
  }
);

    await Gig.findByIdAndUpdate(proposal.gig._id, {
      status: "In Progress",
    });

    await Proposal.updateMany(
      {
        gig: proposal.gig._id,
        _id: { $ne: proposal._id },
      },
      {
        status: "Rejected",
      }
    );

    res.status(200).json({
      success: true,
      message: "Proposal accepted",
      proposal,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Reject Proposal
// @route PUT /api/proposals/:id/reject
// @access Private (Client)
export const rejectProposal = async (req, res) => {

  try {

   const proposal = await Proposal.findById(req.params.id).populate("gig");

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    proposal.status = "Rejected";

    await proposal.save();
    const freelancer = await Freelancer.findById(
  proposal.freelancer
).populate("user");

await createNotification(
  freelancer.user._id,
  "Proposal Rejected",
  `Your proposal for "${proposal.gig.title}" was rejected.`,
  "Proposal",
  "/freelancer/proposals"
);

    res.status(200).json({
      success: true,
      message: "Proposal rejected",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc Withdraw Proposal
// @route DELETE /api/proposals/:id
// @access Private (Freelancer)
export const withdrawProposal = async (req, res) => {

  try {

    const freelancer = await Freelancer.findOne({
      user: req.user._id,
    });

    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    if (proposal.freelancer.toString() !== freelancer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (proposal.status === "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Accepted proposal cannot be withdrawn",
      });
    }
    const gig = await Gig.findById(proposal.gig);

const client = await Client.findById(gig.client).populate("user");

await createNotification(
  client.user._id,
  "Proposal Withdrawn",
  "A freelancer has withdrawn their proposal.",
  "Proposal",
  `/client/gigs/${gig._id}`
);
await sendEmail({

to:client.user.email,

subject:"New Proposal",

html:proposalEmail(gig.title)

});

    await proposal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Proposal withdrawn successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};