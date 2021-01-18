const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "A user must have a username"],
  },

  slugUsername: String,

  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Email invalid"],
  },

  password: {
    type: String,
    required: [true, "Invalid password"],
    minlength: 8,
  },

  joinDate: {
    type: Date,
    default: Date.now,
  },

  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  avatar: {
    type: String,
    default: "defaultAvatar.jpg",
  },

  theme: {
    type: String,
    enum: ["spring", "summer", "autumn", "winter"],
    default: "spring",
  },
});

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

userSchema.virtual("images", {
  ref: "Image",
  localField: "_id",
  foreignField: "author",
});

userSchema.virtual("notifications", {
  ref: "Notification",
  localField: "_id",
  foreignField: "target",
});

userSchema.pre("save", function (next) {
  this.slugUsername = slugify(this.username, { lower: true });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
