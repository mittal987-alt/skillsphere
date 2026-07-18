import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
{
    gig:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Gig",
        required:true
    },

    freelancer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Freelancer",
        required:true
    },


    coverLetter:{
        type:String,
        required:true,
        trim:true
    },

    bidAmount:{
        type:Number,
        required:true
    },

    estimatedDays:{
        type:Number,
        required:true
    },

    status:{
        type:String,
        enum:[
            "Pending",
            "Accepted",
            "Rejected",
            "Withdrawn",
            "Completed",
            "Approved"
        ],
        default:"Pending"
    }

},
{
    timestamps:true
});

proposalSchema.index(
{
    gig:1,
    freelancer:1
},
{
    unique:true
});

export default mongoose.model("Proposal",proposalSchema);