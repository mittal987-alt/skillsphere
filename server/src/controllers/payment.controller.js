import Client from "../models/client.js";
import Freelancer from "../models/Freelancer.js";

import Payment from "../models/payment.js";
import Proposal from "../models/Proposal.js";
import Gig from "../models/Gig.js";
import Razorpay from "razorpay";
import { sendEmail } from "../services/email.service.js";
import paymentEmail from "../../templates/paymentEmail.js";
import crypto from "crypto";


export const createOrder = async (req, res) => {
  try {
    const { proposalId } = req.body;

    const client = await Client.findOne({
      user: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    const proposal = await Proposal.findById(proposalId)
      .populate("gig")
      .populate("freelancer");

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    if (proposal.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Proposal must be accepted before payment.",
      });
    }

    const options = {
      amount: proposal.bidAmount * 100,
      currency: "INR",
      receipt: `receipt_${proposal._id}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      gig: proposal.gig._id,
      proposal: proposal._id,
      client: client._id,
      freelancer: proposal.freelancer._id,
      amount: proposal.bidAmount,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      order,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "Paid";

    await payment.save();
  

const freelancer = await Freelancer.findById(payment.freelancer)
  .populate("user");

await sendEmail({
  to: freelancer.user.email,
  subject: "Payment Received",
  html: paymentEmail(payment.amount),
});

    await Gig.findByIdAndUpdate(payment.gig, {
      status: "In Progress",
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getMyPayments = async (req, res) => {
  try {
    const client = await Client.findOne({
      user: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    const payments = await Payment.find({
      client: client._id,
    })
      .populate("gig", "title")
      .populate({
        path: "freelancer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFreelancerPayments = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({
      user: req.user._id,
    });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
    }

    const payments = await Payment.find({
      freelancer: freelancer._id,
      status: "Paid",
    })
      .populate("gig", "title")
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    const totalEarnings = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    res.status(200).json({
      success: true,
      totalEarnings,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("gig", "title")
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "freelancer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter((payment) => payment.status === "Paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      success: true,
      totalRevenue,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
