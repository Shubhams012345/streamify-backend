const { upsertStreamUser } = require('../lib/stream');
const User=require('../models/User')
exports.onBoarding=async (req,res)=>{
  try{
    const userId=req.user._id;
    const{fullName,bio,nativeLanguage,learningLanguage,location}=req.body
    if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
      return res.status(400).json({
        success:false,
        message:"All fields are required"
      })
    }
    const updatedUser=await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnboarded:true,
    },{new:true})

    try{
      await upsertStreamUser({
        id:updatedUser._id.toString(),
        name:updatedUser.fullName,
        image:updatedUser.profilePic
      })
      console.log(`stream user updated after onBoarding for ${updatedUser.fullName}`)
    }
    catch(streamError){
     console.log("Error updating stream user after onBoarding",streamError.message)
    }
    res.status(200).json({success:true,message:"User on boarded succesfully"})
  }
  catch(error){
     console.log(error)
     res.status(500).json({
      success:false,
      message:"error in onBoarding"
     })
  }
}