import Dispute from "../models/Dispute.js";
import Gig from "../models/Gig.js";
import Proposal from "../models/Proposal.js";
import Payment from "../models/Payment.js";
import Client from "../models/client.js";
import Freelancer from "../models/Freelancer.js";
import createNotification from "../utils/createNotification.js";

// @desc    File a dispute
// @route   POST /api/disputes
// @access  Private
export const fileDispute = async (req, res) => {
  try {
    const { gigId, milestoneId, reason, evidenceMessage, evidenceFile } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    // Check user is participant
    const client = await Client.findOne({ user: req.user._id });
    const freelancer = await Freelancer.findOne({ user: req.user._id });

    let dbClient, dbFreelancer;
    if (client) {
      if (gig.client.toString() !== client._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
      dbClient = client;
      // Find freelancer
      const prop = await Proposal.findOne({ gig: gigId, status: "Accepted" });
      if (prop) dbFreelancer = await Freelancer.findById(prop.freelancer);
    } else if (freelancer) {
      const prop = await Proposal.findOne({ gig: gigId, freelancer: freelancer._id, status: "Accepted" });
      if (!prop) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
      dbFreelancer = freelancer;
      dbClient = await Client.findById(gig.client);
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!dbClient || !dbFreelancer) {
      return res.status(400).json({ success: false, message: "Both client and freelancer must exist" });
    }

    // Check if dispute already exists for this milestone
    const existing = await Dispute.findOne({ gig: gigId, milestoneId, status: "Pending" });
    if (existing) {
      return res.status(400).json({ success: false, message: "An active dispute is already open for this milestone" });
    }

    const dispute = await Dispute.create({
      gig: gigId,
      milestoneId,
      client: dbClient._id,
      freelancer: dbFreelancer._id,
      initiatedBy: req.user._id,
      reason,
      evidence: [
        {
          submittedBy: req.user._id,
          message: evidenceMessage,
          fileUrl: evidenceFile,
        },
      ],
    });

    // Notify the other party
    const recipient = req.user._id.toString() === dbClient.user.toString() 
      ? dbFreelancer 
      : dbClient;

    const populatedRecipient = await recipient.populate("user");
    if (populatedRecipient) {
      await createNotification(
        populatedRecipient.user._id,
        "Dispute Filed",
        `A formal dispute has been filed regarding milestone "${milestone.title}" of "${gig.title}".`,
        "system",
        `/gigs/${gigId}/tracker`
      );
    }

    res.status(201).json({
      success: true,
      message: "Dispute submitted successfully to administrators.",
      dispute,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit extra evidence
// @route   POST /api/disputes/:id/evidence
// @access  Private
export const submitEvidence = async (req, res) => {
  try {
    const { message, fileUrl } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    if (dispute.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Dispute is already resolved" });
    }

    dispute.evidence.push({
      submittedBy: req.user._id,
      message,
      fileUrl,
    });

    await dispute.save();

    res.json({
      success: true,
      message: "Evidence submitted successfully",
      dispute,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a dispute (Admin only)
// @route   POST /api/disputes/:id/resolve
// @access  Private (Admin)
export const resolveDispute = async (req, res) => {
  try {
    const { decision, notes } = req.body; // decision: 'Refunded' (refund client) or 'Released' (pay freelancer)

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only administrators can resolve disputes" });
    }

    const dispute = await Dispute.findById(req.params.id).populate("client freelancer gig");
    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    if (dispute.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Dispute has already been resolved" });
    }

    const gig = dispute.gig;
    const milestone = gig.milestones.id(dispute.milestoneId);

    // Update dispute schema
    dispute.status = decision === "Refunded" ? "Resolved_Refunded" : "Resolved_Released";
    dispute.ruling = {
      decision,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      notes,
    };
    await dispute.save();

    // Release or refund payment record
    const payment = await Payment.findOne({
      gig: dispute.gig._id,
      status: "Paid",
      amount: milestone.amount,
    });

    if (payment) {
      payment.status = decision === "Refunded" ? "Refunded" : "Released";
      await payment.save();
    }

    // Update milestone completions/status
    if (decision === "Released") {
      milestone.status = "Completed";
      milestone.completed = true;
    } else {
      milestone.status = "Pending"; // return back to pending (client got refund, can fund later or rewrite contract)
      milestone.completed = false;
    }
    await gig.save();

    // Notify client and freelancer
    const populatedClient = await dispute.client.populate("user");
    const populatedFreelancer = await dispute.freelancer.populate("user");

    const messageToParties = `Dispute Ruling Released: Admin has ruled in favor of ${decision === "Refunded" ? "Client (Refund)" : "Freelancer (Payout)"}. Details: ${notes}`;

    await createNotification(populatedClient.user._id, "Dispute Resolved", messageToParties, "system", `/gigs/${gig._id}/tracker`);
    await createNotification(populatedFreelancer.user._id, "Dispute Resolved", messageToParties, "system", `/gigs/${gig._id}/tracker`);

    res.json({
      success: true,
      message: `Dispute resolved successfully with decision: ${decision}`,
      dispute,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private
export const getDisputes = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      const client = await Client.findOne({ user: req.user._id });
      const freelancer = await Freelancer.findOne({ user: req.user._id });

      if (client) {
        query.client = client._id;
      } else if (freelancer) {
        query.freelancer = freelancer._id;
      } else {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
    }

    const disputes = await Dispute.find(query)
      .populate({
        path: "client",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "freelancer",
        populate: { path: "user", select: "name email" },
      })
      .populate("gig")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
