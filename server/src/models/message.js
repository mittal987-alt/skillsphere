import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
{
    conversation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true
    },

    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    message:{
        type:String,
        required:true
    },

    attachments:[
        String
    ],

    seen:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
});

export default mongoose.model(
    "Message",
    messageSchema
);