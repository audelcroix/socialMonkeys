const User = require("../models/User");
const Notification = require("../models/Notification");

// Get all user's friends
exports.getAllFriends = async (req, res) => {
  try {
    let myFriends = await User.findById(req.user.id)
      .populate("friends")
      .select("friends");

    return res.status(200).json({ friends: myFriends.friends });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Add a friend
exports.addFriend = async (req, res) => {
  try {
    // Check if user asked themselves
    if (req.user.id == req.params.id) {
      return res
        .status(400)
        .json({ msg: "Friend request impossible for this member" });
    }

    let newFriend = await User.findById(req.params.id).populate(
      "notifications"
    );

    // Check if friend exists
    if (!newFriend) {
      return res.status(400).json({ msg: "This user does not exist" });
    }

    // Check if user already sent a request
    let existingRequests = await Notification.find({
      author: req.user.id,
      notifType: "friend",
      target: req.params.id,
    });

    if (existingRequests.length > 0) {
      return res
        .status(400)
        .json({ msg: "You already sent a friend request to this user" });
    }

    let newNotification = new Notification({
      notifType: "friend",
      author: req.user,
      target: newFriend,
    });

    newNotification.save();

    return res.status(200).json({
      msg: `Your request has been sent to ${newFriend.username} for approval`,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Accept friend request
exports.acceptFriend = async (req, res) => {
  try {
    // check if invitation exists
    let invitation = await Notification.findById(req.params.id).populate(
      "author"
    );

    if (!invitation) {
      return res.status(400).json({ msg: "This invitation doesn't exist" });
    }

    // check if is friend request
    if (invitation.notifType !== "friend") {
      return res.status(400).json({ msg: "This friend request doesn't exist" });
    }

    // check if author still exists
    let author = await User.findById(invitation.author.id);

    if (!author) {
      return res.status(400).json({ msg: "This user doesn't exist" });
    }

    // check if is right target
    if (invitation.target != req.user.id) {
      return res
        .status(400)
        .json({ msg: "This invitation seems to not be directed towards you" });
    }

    // check if the two are already friends
    if (req.user.friends.includes(invitation.author.id)) {
      return res.status(400).json({
        msg: `You and ${invitation.author.username} are already friends`,
      });
    }

    // delete notification
    Notification.findByIdAndRemove(req.params.id, (err, removedDoc) => {
      if (err) throw err;
    });

    // UPDATING BOTH FRIENDS LISTS

    // update the author's friends list
    let updatedAuthorFriends = {
      friends: [req.user, ...invitation.author.friends],
    };

    User.findByIdAndUpdate(
      invitation.author,
      updatedAuthorFriends,
      (err, updatedUser) => {
        if (err) throw err;
      }
    );

    // update the target's friends list
    let updatedTargetFriends = {
      friends: [invitation.author, ...req.user.friends],
    };

    User.findByIdAndUpdate(
      req.user,
      updatedTargetFriends,
      { new: true },
      (err, updatedUser) => {
        if (err) throw err;

        return res.status(200).json({ msg: "Success", updatedUser });
      }
    );
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Decline friend request
exports.declineFriend = async (req, res) => {
  try {
    let invitation = await Notification.findById(req.params.id);

    // check if invitation exists
    if (!invitation || invitation.notifType !== "friend") {
      return res.status(400).json({ msg: "This invitation doesn't exist" });
    }

    // check if is right target
    if (invitation.target != req.user.id) {
      return res
        .status(400)
        .json({ msg: "This invitation seems to not be directed towards you" });
    }

    // check if the two are already friends
    if (req.user.friends.includes(invitation.author.id)) {
      return res.status(400).json({
        msg: `You and ${invitation.author.username} are already friends`,
      });
    }

    // delete notification
    Notification.findByIdAndRemove(req.params.id, (err) => {
      if (err) throw err;
    });

    return res.status(200).json({ msg: "success" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Remove from friends list
exports.removeFriend = async (req, res) => {
  try {
    // check if both are friends
    if (
      !req.user.friends.some((friend) => {
        return friend.id === req.params.id;
      })
    ) {
      return res.status(400).json({
        msg: "Removal impossible, you are not friends with this user.",
      });
    }

    // FORMER FRIEND'S SIDE

    let friend = await User.findById(req.params.id).populate("friends");

    // if friend still exists and is friends with user, update their friends list
    if (friend || friend.friends.includes(req.user.id)) {
      // remove from former friend's friends list
      const updatedTargetFriends = friend.friends.filter((targetsFriend) => {
        return targetsFriend.id !== req.user.id;
      });

      User.findByIdAndUpdate(
        req.params.id,
        { friends: updatedTargetFriends },

        (err) => {
          if (err) throw err;
        }
      );
    }

    // USER'S SIDE

    // remove from user's friends list
    let updatedFriends = req.user.friends.filter((usersFriend) => {
      return usersFriend.id !== req.params.id;
    });

    User.findByIdAndUpdate(
      req.user,
      { friends: updatedFriends },
      { new: true },
      (err, updatedUser) => {
        if (err) throw err;

        return res.status(200).json({ user: updatedUser });
      }
    );
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};
