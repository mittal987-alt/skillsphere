import Gig from "../models/Gig.js";
import Payment from "../models/Payment.js";
import Proposal from "../models/Proposal.js";
import Freelancer from "../models/Freelancer.js";
import Client from "../models/client.js";
import createNotification from "../utils/createNotification.js";

// @desc    Fund milestone (Lock budget in Escrow)
// @route   POST /api/milestones/:gigId/:milestoneId/fund
// @access  Private (Client)
export const fundMilestone = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.params;

    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    if (gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    if (milestone.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Milestone is already funded or completed" });
    }

    // Update milestone status
    milestone.status = "Funds_Escrowed";
    await gig.save();

    // Find the accepted proposal to link the freelancer
    const proposal = await Proposal.findOne({ gig: gigId, status: "Accepted" });
    if (!proposal) {
      return res.status(400).json({ success: false, message: "No active freelancer/proposal found for this gig" });
    }

    // Create Escrow Payment log
    const amount = milestone.amount;
    const platformFee = amount * 0.1; // 10%
    const freelancerAmount = amount - platformFee;

    await Payment.create({
      gig: gigId,
      client: client._id,
      freelancer: proposal.freelancer,
      proposal: proposal._id,
      amount,
      platformFee,
      freelancerAmount,
      currency: "INR",
      paymentMethod: "Escrow (Wallet)",
      status: "Paid", // Paid into Escrow
    });

    const freelancer = await Freelancer.findById(proposal.freelancer).populate("user");
    if (freelancer) {
      await createNotification(
        freelancer.user._id,
        "Milestone Funded",
        `Funds for milestone "${milestone.title}" of "${gig.title}" are locked in Escrow. You can start working!`,
        "payment",
        `/freelancer/proposals`
      );
    }

    res.json({
      success: true,
      message: "Milestone successfully funded. Funds locked in Escrow.",
      milestone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit milestone work
// @route   POST /api/milestones/:gigId/:milestoneId/submit
// @access  Private (Freelancer)
export const submitMilestone = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.params;
    const { message, fileUrl } = req.body;

    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer profile not found" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    if (milestone.status !== "Funds_Escrowed") {
      return res.status(400).json({ success: false, message: "You can only submit work once funds are escrowed" });
    }

    // Update milestone status and submission details
    milestone.status = "Under_Review";
    milestone.submission = {
      message,
      fileUrl,
      submittedAt: new Date(),
    };
    await gig.save();

    const client = await Client.findById(gig.client).populate("user");
    if (client) {
      await createNotification(
        client.user._id,
        "Milestone Delivery Submitted",
        `Work for milestone "${milestone.title}" of "${gig.title}" has been submitted for review.`,
        "gig",
        `/client/gigs`
      );
    }

    res.json({
      success: true,
      message: "Milestone deliverable submitted successfully.",
      milestone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve deliverable & release escrow funds
// @route   POST /api/milestones/:gigId/:milestoneId/approve
// @access  Private (Client)
export const approveMilestone = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.params;

    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    if (gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    if (milestone.status !== "Under_Review") {
      return res.status(400).json({ success: false, message: "No work under review for this milestone" });
    }

    // Mark milestone as completed
    milestone.status = "Completed";
    milestone.completed = true;

    // If all milestones are completed, mark gig as Completed
    const allMilestonesCompleted = gig.milestones.every(m => m.status === "Completed");
    if (allMilestonesCompleted) {
      gig.status = "Completed";
    }

    await gig.save();

    // Release funds: find the Escrow payment and update it to "Released"
    const payment = await Payment.findOne({
      gig: gigId,
      status: "Paid",
      amount: milestone.amount,
    });

    if (payment) {
      payment.status = "Released";
      await payment.save();
    }

    // Notify freelancer
    const proposal = await Proposal.findOne({ gig: gigId, status: "Accepted" });
    if (proposal) {
      const freelancer = await Freelancer.findById(proposal.freelancer).populate("user");
      if (freelancer) {
        await createNotification(
          freelancer.user._id,
          "Milestone Approved & Funds Released",
          `Congratulations! Your submission for "${milestone.title}" has been approved. Funds are released.`,
          "payment",
          `/freelancer/earnings`
        );
      }
    }

    res.json({
      success: true,
      message: "Milestone approved and escrow funds released to freelancer.",
      milestone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject milestone delivery (Request revisions)
// @route   POST /api/milestones/:gigId/:milestoneId/reject
// @access  Private (Client)
export const rejectMilestone = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.params;
    const { rejectionReason } = req.body;

    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    if (gig.client.toString() !== client._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    if (milestone.status !== "Under_Review") {
      return res.status(400).json({ success: false, message: "No work under review for this milestone" });
    }

    // Reset status back to Funds_Escrowed and add rejection note
    milestone.status = "Funds_Escrowed";
    if (milestone.submission) {
      milestone.submission.message = `[Revision Requested]: ${rejectionReason || "Please review and resubmit."}`;
    }
    await gig.save();

    // Notify freelancer
    const proposal = await Proposal.findOne({ gig: gigId, status: "Accepted" });
    if (proposal) {
      const freelancer = await Freelancer.findById(proposal.freelancer).populate("user");
      if (freelancer) {
        await createNotification(
          freelancer.user._id,
          "Milestone Revision Requested",
          `Client requested revision for "${milestone.title}". Reason: ${rejectionReason || "Check details."}`,
          "gig",
          `/freelancer/proposals`
        );
      }
    }

    res.json({
      success: true,
      message: "Milestone deliverable rejected. Revision requested.",
      milestone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
