const {generateStreamToken}=require('../lib/stream')
exports.getStreamToken=async(req,res)=>{
    try{
      const token=generateStreamToken(req.user.id);
      res.status(200).json({success:true,token})
    }
    catch(error){
       console.log(error)
       res.status(500).json({
        success:false,
        message:"error in getStreamToken controller"
       })
    }
}