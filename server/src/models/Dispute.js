import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    milestoneId: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    evidence: [
      {
        submittedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        fileUrl: String,
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Resolved_Refunded", "Resolved_Released"],
      default: "Pending",
    },
    ruling: {
      decision: String, // 'Refunded' or 'Released'
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

const Dispute = mongoose.models.Dispute || mongoose.model("Dispute", disputeSchema);
export default Dispute;
