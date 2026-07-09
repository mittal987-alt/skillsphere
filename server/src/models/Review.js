import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
{
    gig:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Gig",
        required:true
    },

    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client",
        required:true
    },

    freelancer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Freelancer",
        required:true
    },

    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },

    review:{
        type:String,
        required:true,
        trim:true
    }

},
{
    timestamps:true
});

reviewSchema.index(
{
    gig:1,
    client:1
},
{
    unique:true
});

export default mongoose.model("Review",reviewSchema);