import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    companyName:{
        type:String,
        required:true
    },

    companyLogo:{
        type:String,
        default:""
    },

    companyWebsite:{
        type:String,
        default:""
    },

    industry:{
        type:String,
        default:""
    },

    companySize:{
        type:String,
        enum:[
            "1-10",
            "11-50",
            "51-200",
            "201-500",
            "500+"
        ],
        default:"1-10"
    },

    description:{
        type:String,
        default:""
    },

    location:{
        type:String,
        default:""
    },

    verified:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
});

export default mongoose.model("Client",clientSchema);