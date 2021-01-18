const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notifType: {
    type: String,
    enum: [
      "like",
      "friend",
      "like_img",
      "like_comment",
      "friend_accept",
      "comment",
      "system",
    ],
    default: "system",
  }, // If enum is changed, change possible types in getmynotifications

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A notification has to be related to a user"],
  },

  associatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Post",
    default: null,
  },

  associatedImage: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Image",
    default: null,
  },

  associatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Comment",
    default: null,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  wasRead: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
