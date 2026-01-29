const express=require("express")
const router=express.Router();
const {auth}=require('../middileware/auth')
const {signup,login,logout}=require("../controller/auth")
const {onBoarding}=require('../controller/onBoarding')
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/onBoarding",auth,onBoarding)

router.get("/me",auth,(req,res)=>{
    res.status(200).json({sucess:true,user:req.user})
})
module.exports =router;