import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
{
    gig:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Gig",
        required:true
    },

    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    freelancer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    lastMessage:{
        type:String,
        default:""
    },

    lastMessageAt:{
        type:Date,
        default:Date.now
    }

},
{
    timestamps:true
});

conversationSchema.index(
{
    gig:1,
    client:1,
    freelancer:1
},
{
    unique:true
});

export default mongoose.model(
    "Conversation",
    conversationSchema
);