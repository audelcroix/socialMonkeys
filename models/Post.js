const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: [true, "One must be connected to post"],
  },

  content: {
    type: String,
    require: [true, "A post cannot be empty"],
    trim: true,
    minlength: [1, "Posts must have at least 1 character"],
    maxlength: [1000, "Posts are limited to 1000 characters"],
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

postSchema.virtual("likeCount").get(function () {
  return this.likes.length();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
