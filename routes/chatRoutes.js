const express=require('express')
const router=express.Router()
const {auth}=require('../middileware/auth')
const {getStreamToken}=require('../controller/chatController')


router.get("/token",auth,getStreamToken)

module.exports=router