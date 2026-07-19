import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    title: {
    type: String,
    default: "",
},

    bio:{
        type:String,
        default:""
    },

    skills:[
        {
            type:String
        }
    ],

    hourlyRate:{
        type:Number,
        default:0
    },

    experience:{
        type:Number,
        default:0
    },

    availability:{
        type:String,
        enum:["Available","Busy","Offline"],
        default:"Available"
    },

    languages:[
        {
            type:String
        }
    ],

    resume:{
        type:String,
        default:""
    },

    profileCompleted:{
        type:Boolean,
        default:false
    },
    averageRating: {
    type: Number,
    default: 0,
},

totalReviews: {
    type: Number,
    default: 0,
},
    portfolio:[
{
    title:String,

    description:String,

    projectUrl:String,

    image:String

}
],

certifications:[
{

    name:String,

    organization:String,

    issueDate:Date

}
],

bankDetails: {
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    bankName: { type: String, default: "" }
}

},
{
    timestamps:true
});

export default mongoose.model("Freelancer",freelancerSchema);