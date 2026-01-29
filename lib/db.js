const mongoose=require('mongoose')
const dotenv=require("dotenv")
dotenv.config();
const url=process.env.MONGODB_URI
exports.connect=async ()=>{
    try{
      const conn=await mongoose.connect(url);
      console.log(`Mongodb connected:${conn.connection.host}`)
    }
    catch(err){
        console.log("can't connect to db",err)
        process.exit(1);
    }
}