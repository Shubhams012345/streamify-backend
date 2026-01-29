const validator=require('validator')
const User=require('../models/User')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const {upsertStreamUser}=require('../lib/stream')
exports.signup=async(req,res)=>{

    try{
      const{fullName,email,password}=req.body
      if(!fullName || !email || !password){
        return res.status(400).json({message:"All fields are required"})
      }
      if(password.length<6){
        return res.status(400).json({message:"password atleast should be of 6 characters"})
      }
      if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const isEmailexists=await  User.findOne({email});
    if(isEmailexists){
      return res.status(401).json({message:"user with this email already exists"})
    }

  
      const userProfile=`https://api.dicebear.com/5.x/initials/svg?seed=${fullName}`
      const newUser=await User.create({
        fullName,
        email,
        password,
        profilePic:userProfile
      })
    
     try{
       await upsertStreamUser({
        id:newUser._id.toString(),
        name:newUser.fullName,
        image:newUser.profilePic
      })
      console.log(`stream user created for ${newUser.fullName}`)
     }
     catch(error){
      console.log("Error creating stream user",error);
     }

      const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY,{
        expiresIn:"7d"
      })
      res.cookie("jwt",token,{
         httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "none",
          secure: true,
          path: "/"
      })
       const {password:passwordHided,...safeuser}=newUser._doc
       
      res.status(200).json({
        success:true,
        user:safeuser,
        message:"signup successful"
      })
    }
    catch(error){
     console.log("error in signup controller",error)
     res.status(500).json({
      success:false,
      message:"Internal server error"
     })
    }
}
exports.login=async(req,res)=>{
    try{
       
      const{email,password}=req.body;
       if(!email || !password){
        return res.status(400).json({success:false,message:"all fields are required"})
       }
       const userExist=await User.findOne({email});
       if(!userExist){
        return res.status(400).json({success:false,message:"Invalid email or password"})
       }
    
       const isPasswordCorrect=await bcrypt.compare(password,userExist.password)
       if(!isPasswordCorrect){
        return res.status(401).json({
          success:false,
          message:"password is Invalid"
        })
       }
       const token=jwt.sign({userId:userExist._id},process.env.JWT_SECRET_KEY,{
        expiresIn:"7d"
      })
      res.cookie("jwt",token,{
         httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
         sameSite: "none",
         secure: true,
         path: "/"
      })
      const { password:hiddenPassword, ...safeUser } = userExist._doc


      res.status(200).json({
        success:true,
        message:"login successful",
        user:safeUser
      })
    }
    catch(error){
      console.log("error in login controller",error)
      res.status(500).json({
        success:false,
        message:"Internal server erro"
      })
    }
}
exports.logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });

  res.status(200).json({
    success: true,
    message: "logout successful"
  });
};
