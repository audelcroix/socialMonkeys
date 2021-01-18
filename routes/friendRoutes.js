const express = require("express");

const friendController = require("../controllers/friendController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// Get all user's friends
router.route("/").get(protect, friendController.getAllFriends);

// Send a friend request
router.route("/add/:id").post(protect, friendController.addFriend);

// Accept a friend request
router.route("/acceptfriend/:id").post(protect, friendController.acceptFriend);

// Decline a friend request
router
  .route("/declinefriend/:id")
  .post(protect, friendController.declineFriend);

// Remove a friend
router.route("/:id").delete(protect, friendController.removeFriend);

module.exports = router;
