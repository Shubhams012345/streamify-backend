const jwt=require('jsonwebtoken')
const User=require('../models/User')
const dotenv=require('dotenv')
dotenv.config()
exports.auth=async(req,res,next)=>{
    try{
      const token=req.cookies?.jwt
     if(!token){
        return res.status(401).json({success:false,message:"unauthorized access ,Invalid token"})
     }
     const decode=await jwt.verify(token,process.env.JWT_SECRET_KEY);
      
     const user=await User.findById(decode.userId).select("-password");
     if(!user){
        res.status(401).json({success:false,message:"Invalid user "})
     }
     req.user=user;
     next();
    }
    catch(error){
      console.log(error)
      res.status(500).json({success:false,message:"error in auth middileware"})
    }
}