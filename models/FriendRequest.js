const mongoose=require('mongoose')
const friendRequestSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    status:{
        type:String,
        enum:["pending","accepted"],
        default:"pending",
    },
    
   isRead: {
  type: Boolean,
  default: false
}
 },
 {timestamps:true}
)
const FriendRequest=mongoose.model("FriendRequest",friendRequestSchema)
module.exports= FriendRequest;