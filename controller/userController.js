const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')

exports.getRecomendedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Un logo ki IDs nikalein jo ya toh aapke friends hain 
    // YA jinhone aapko request bheji hai (Incoming)
    const existingInteractions = await FriendRequest.find({
      $or: [
        { status: "accepted" }, // Friends (dono side)
        { recipient: userId, status: "pending" } // Incoming requests (Jo mujhe aayi hain)
      ]
    });

    // In IDs ko filter list mein daalein
    const excludeIds = existingInteractions.map(req => 
      req.sender.toString() === userId.toString() ? req.recipient : req.sender
    );

    // Apni ID bhi add karein
    excludeIds.push(userId);

    // 2. Recommendation query
    const recomendedUsers = await User.find({
      _id: { $nin: excludeIds },
      isOnboarded: true
    }).limit(15);

    res.status(200).json({ success: true, recomendedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in recommendations" });
  }
};

exports.getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json({
      success: true,
      friends: user.friends.filter(Boolean)
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error in getMyFriends" });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: recipientId } = req.params;

    // Check if reverse request already exists
    const reverseRequest = await FriendRequest.findOne({
      sender: recipientId,
      recipient: senderId,
      status: "pending"
    });

    if (reverseRequest) {
      // Agar samne wale ne pehle se bhej rakhi hai, toh seedha accept karlo!
      reverseRequest.status = "accepted";
      reverseRequest.isRead = false;
      await reverseRequest.save();

      await Promise.all([
        User.findByIdAndUpdate(senderId, { $addToSet: { friends: recipientId } }),
        User.findByIdAndUpdate(recipientId, { $addToSet: { friends: senderId } })
      ]);

      return res.status(200).json({ success: true, message: "Mutual request! You are now friends." });
    }

    // Normal flow: check for existing request
    const existingReq = await FriendRequest.findOne({
      sender: senderId, recipient: recipientId
    });

    if (existingReq) return res.status(400).json({ success: false, message: "Already sent" });

    await FriendRequest.create({ sender: senderId, recipient: recipientId });
    res.status(200).json({ success: true, message: "Request sent" });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) return res.status(400).json({ success: false, message: "Request not found" });

    friendRequest.status = "accepted";
    friendRequest.isRead = false; 
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: friendRequest.recipient } });
    await User.findByIdAndUpdate(friendRequest.recipient, { $addToSet: { friends: friendRequest.sender } });

    res.status(200).json({ success: true, message: "Friend added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cannot accept friend request" });
  }
};

exports.getFriendRequest = async (req, res) => {
  try {
    const pendingRequest = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending"
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedRequest = await FriendRequest.find({
      sender: req.user.id, 
      status: "accepted"
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ success: true, pendingRequest, acceptedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in getFriendRequest" });
  }
};

exports.getOutgoingFriendRequest = async (req, res) => {
  try {
    const outGoingRequest = await FriendRequest.find({
      sender: req.user.id,
      status: "pending"
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json({
      success: true,
      outGoingRequest
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error in getOutgoingFriendRequest controller" });
  }
};
exports.markNotificationsAsRead = async (req, res) => {
  try {
    await FriendRequest.updateMany(
      { recipient: req.user.id, isRead: false }, 
      { $set: { isRead: true } }
    );
    
    await FriendRequest.updateMany(
      { sender: req.user.id, status: "accepted", isRead: false }, 
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};