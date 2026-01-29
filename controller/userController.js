const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')

exports.getRecomendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recomendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true }
      ]
    });

    res.status(200).json({
      success: true,
      recomendedUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error in recomendedUsers controller" });
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
    const userId = req.user._id;
    const { id: recipientId } = req.params;

    if (userId.toString() === recipientId) {
      return res.status(400).json({ success: false, message: "You can't send request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ success: false, message: "Recipient not found" });
    }

    if (recipient.friends.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Friend request already exists" });
    }

    await FriendRequest.create({
      sender: userId,
      recipient: recipientId
    });

    res.status(200).json({ success: true, message: "Friend request sent" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error in sending friend request" });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(400).json({ success: false, message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient }
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender }
    });

    res.status(200).json({ success: true, message: "Friend added successfully" });

  } catch (error) {
    console.log(error);
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
      recipient: req.user.id,
      status: "accepted"
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ success: true, pendingRequest, acceptedRequest });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error in getFriendRequest" });
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
