import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    username:{
      type:String,
      required:true,
      unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePhoto:{
        type:String,
        default:""
    },
    gender:{
        type:String,
        enum:["male", "female"],
        required:true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
    
}, {timestamps:true});
export default mongoose.model("User", userSchema);