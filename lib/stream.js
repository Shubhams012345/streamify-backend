const { StreamChat } = require("stream-chat")
const dotenv=require('dotenv')
dotenv.config();

const apiKey=process.env.STREAM_API_KEY;
const apiSecret=process.env.STREAM_API_SECRET;

if(!apiKey ||!apiSecret){
    console.error("Stream api key or secret is missing")
}
const streamClient = new StreamChat(apiKey, apiSecret)

exports.upsertStreamUser=async(userData)=>{
    try{
   await streamClient.upsertUsers([userData]);
   return userData;
    }
    catch(error){
     console.error("Error upserrting Stream user:",error);
    }
}
exports.generateStreamToken=(userId)=>{
    try{
        const userIdStr=userId.toString();
        return streamClient.createToken(userIdStr);
    }
    catch(error){
        console.log("error genrating stream token",error)
    }
}