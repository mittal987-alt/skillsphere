import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    portfolioUrl: {
      type: String,
      required: true,
    },
    idCardNumber: {
      type: String,
      required: true,
    },
    idCardUrl: {
      type: String, // Government ID document upload link
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const VerificationRequest =
  mongoose.models.VerificationRequest ||
  mongoose.model("VerificationRequest", verificationRequestSchema);

export default VerificationRequest;
