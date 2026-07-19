import Client from "../models/client.js";
import Freelancer from "../models/Freelancer.js";

import Payment from "../models/payment.js";
import Proposal from "../models/Proposal.js";
import Gig from "../models/Gig.js";
import Razorpay from "razorpay";
import { sendEmail } from "../services/email.service.js";
import paymentEmail from "../../templates/paymentEmail.js";
import crypto from "crypto";

// ── Platform fee (10% of each transaction) ──
const PLATFORM_FEE_RATE = 0.10;

// ── Razorpay client (must be at top-level before any handler uses it) ──
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────
// CREATE ORDER  (Client)
// ─────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { proposalId } = req.body;

    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const proposal = await Proposal.findById(proposalId)
      .populate("gig")
      .populate("freelancer");

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    if (!["Accepted", "Completed"].includes(proposal.status)) {
      return res.status(400).json({
        success: false,
        message: "Proposal must be accepted or completed before payment.",
      });
    }

    // Check if a payment already exists for this proposal to avoid duplicates
    const existing = await Payment.findOne({ proposal: proposal._id, status: { $in: ["Paid", "Pending"] } });
    if (existing) {
      // Return the existing order so the client can re-open checkout if needed
      const order = await razorpay.orders.fetch(existing.razorpayOrderId);
      return res.status(200).json({ success: true, order, payment: existing });
    }

    const options = {
      amount: Math.round(proposal.bidAmount * 100), // paise
      currency: "INR",
      receipt: `receipt_${proposal._id}`,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (error) {
      console.warn("Razorpay API failed (keys might be invalid). Falling back to mock order.");
      order = { id: "mock_order_" + Date.now(), amount: options.amount, currency: "INR" };
    }

    const bidAmount = proposal.bidAmount;
    const platformFee = parseFloat((bidAmount * PLATFORM_FEE_RATE).toFixed(2));
    const freelancerAmount = parseFloat((bidAmount - platformFee).toFixed(2));

    const payment = await Payment.create({
      gig: proposal.gig._id,
      proposal: proposal._id,
      client: client._id,
      freelancer: proposal.freelancer._id,
      amount: bidAmount,
      platformFee,
      freelancerAmount,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    res.status(201).json({ success: true, order, payment });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// VERIFY PAYMENT  (Client – called after Razorpay checkout)
// ─────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (razorpay_order_id.startsWith("mock_order_")) {
      console.log("Mock payment verified successfully for order:", razorpay_order_id);
    } else {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
      }
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "Paid";
    await payment.save();

    const proposal = await Proposal.findById(payment.proposal);
    if (proposal) {
      proposal.status = "Approved";
      await proposal.save();
    }

    // Notify freelancer via email and simulate payout
    const freelancer = await Freelancer.findById(payment.freelancer).populate("user");
    
    // Simulate payout to bank account
    if (freelancer?.bankDetails?.accountNumber) {
      console.log(`[PAYOUT SIMULATION] Transferring ₹${payment.freelancerAmount} to ${freelancer.bankDetails.accountHolderName} at ${freelancer.bankDetails.bankName} (Acct: ${freelancer.bankDetails.accountNumber}, IFSC: ${freelancer.bankDetails.ifscCode})`);
    } else {
      console.log(`[PAYOUT SIMULATION] Freelancer has not set up bank details for payout.`);
    }

    if (freelancer?.user?.email) {
      await sendEmail({
        to: freelancer.user.email,
        subject: "Payment Received – Funds in Escrow",
        html: paymentEmail(payment.amount),
      });
    }

    // Mark gig as Completed
    await Gig.findByIdAndUpdate(payment.gig, { status: "Completed" });

    res.status(200).json({ success: true, message: "Payment verified successfully", payment });
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// RELEASE PAYMENT  (Client – releases escrow after work approval)
// ─────────────────────────────────────────────────────────
export const releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid (escrowed) payments can be released.",
      });
    }

    payment.status = "Released";
    await payment.save();

    // Mark gig as Completed
    await Gig.findByIdAndUpdate(payment.gig, { status: "Completed" });

    res.status(200).json({ success: true, message: "Payment released successfully", payment });
  } catch (error) {
    console.error("releasePayment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET MY PAYMENTS  (Client)
// ─────────────────────────────────────────────────────────
export const getMyPayments = async (req, res) => {
  try {
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const payments = await Payment.find({ client: client._id })
      .populate("gig", "title")
      .populate("proposal", "bidAmount estimatedDays")
      .populate({
        path: "freelancer",
        populate: { path: "user", select: "name email avatar" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET FREELANCER PAYMENTS  (Freelancer)
// ─────────────────────────────────────────────────────────
export const getFreelancerPayments = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer profile not found" });
    }

    const payments = await Payment.find({ freelancer: freelancer._id })
      .populate("gig", "title")
      .populate({
        path: "client",
        populate: { path: "user", select: "name email avatar" },
      })
      .sort({ createdAt: -1 });

    // Payments are now "Paid" when fully completed
    const totalEarnings = payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + (p.freelancerAmount ?? p.amount), 0);

    const pendingEarnings = 0; // No escrow anymore
    
    // Count jobs where payment is Paid
    const completedJobs = payments.filter((p) => p.status === "Paid").length;

    res.status(200).json({ 
      success: true, 
      totalEarnings, 
      pendingEarnings, 
      completedJobs,
      averageRating: freelancer.averageRating || 0,
      payments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET ALL PAYMENTS  (Admin)
// ─────────────────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("gig", "title")
      .populate({ path: "client", populate: { path: "user", select: "name email" } })
      .populate({ path: "freelancer", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter((p) => ["Paid", "Released"].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({ success: true, totalRevenue, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
