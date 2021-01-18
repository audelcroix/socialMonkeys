const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: [true, "One must be connected to post an image"],
  },

  image: {
    type: String,
    require: [true, "Image is empty"],
  },

  description: {
    type: String,
    require: false,
    default: null,
    trim: true,
    maxlength: [1000, "Descriptions are limited to 1000 characters"],
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

imageSchema.virtual("likeCount").get(function () {
  return this.likes.length();
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
