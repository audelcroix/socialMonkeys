// COMMENTS are NOT used in this version

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: [true, "One must be connected to comment"],
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

  content: {
    type: String,
    require: [true, "A comment cannot be empty"],
  },

  datePosted: {
    type: Date,
    default: Date.now,
  },

  edited: {
    type: Boolean,
    default: false,
  },

  dateEdited: {
    type: Date,
    default: undefined,
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

commentSchema.virtual("likeCount").get(function () {
  return this.likes.length();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
