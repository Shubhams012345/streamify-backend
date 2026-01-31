const express=require('express')
const router=express.Router();
const {auth}=require('../middileware/auth')
const {getRecomendedUsers,getMyFriends,sendFriendRequest,acceptFriendRequest,getFriendRequest,
    getOutgoingFriendRequest,markNotificationsAsRead
}=require('../controller/userController')

router.use(auth);

router.get("/",getRecomendedUsers);
router.get("/friends",getMyFriends);

router.post("/friend-request/:id",sendFriendRequest)
router.put("/friend-request/:id/accept",acceptFriendRequest)

router.get("/friend-request",getFriendRequest)
router.get("/outgoing-friend-requests",getOutgoingFriendRequest);

router.delete("/notifications/clear", auth, markNotificationsAsRead);

module.exports=router