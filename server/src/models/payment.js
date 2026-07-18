import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
{
    gig:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Gig",
        required:true
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

    proposal:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Proposal",
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    // 10% platform fee retained by SkillSphere
    platformFee:{
        type:Number,
        default:0
    },

    // Amount the freelancer actually receives (amount - platformFee)
    freelancerAmount:{
        type:Number,
        default:0
    },

    currency:{
        type:String,
        default:"INR"
    },

    paymentMethod:{
        type:String,
        default:"Razorpay"
    },

    razorpayOrderId:String,

    razorpayPaymentId:String,

    razorpaySignature:String,

    status:{
        type:String,
        enum:[
            "Pending",
            "Paid",
            "Failed",
            "Refunded",
            "Released"
        ],
        default:"Pending"
    }

},
{
    timestamps:true
});

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);

export default Payment;