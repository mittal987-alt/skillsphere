import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        default:""
    },

    amount:{
        type:Number,
        required:true
    },

    completed:{
        type:Boolean,
        default:false
    }

},{_id:false});

const gigSchema = new mongoose.Schema({

    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client",
        required:true
    },

    title:{
        type:String,
        required:true,
        trim:true
    },

    description:{
        type:String,
        required:true
    },

    category:{
        type:String,
        required:true
    },

    skills:[
        {
            type:String
        }
    ],

    budget:{
        type:Number,
        required:true
    },

    deadline:{
        type:Date
    },

    experienceLevel:{
        type:String,
        enum:["Beginner","Intermediate","Expert"],
        default:"Intermediate"
    },

    status:{
        type:String,
        enum:[
            "Open",
            "In Progress",
            "Completed",
            "Cancelled"
        ],
        default:"Open"
    },

    attachments:[
        String
    ],

    milestones:[
        milestoneSchema
    ]

},{
    timestamps:true
});

export default mongoose.model("Gig",gigSchema);