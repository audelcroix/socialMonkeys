const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const slugify = require("slugify");

const config = require("config");
const jwtSecretKey = config.get("jwtSecretKey");

const { validationResult } = require("express-validator");
const { searchNews } = require("../utils/searchNews");
const {
  searchUsersPostsAndImages,
} = require("../utils/searchUsersPostsAndImages");

const User = require("../models/User");

// Get own newsfeed
exports.getLatestNews = async (req, res) => {
  try {
    let results = await searchNews(req.user);

    if (results && results.length > 0) {
      res.status(200).json({ msg: "Newsfeed fetched", results });
    } else if (results && results.length === 0) {
      res.status(200).json({ msg: "No news for your account" });
    } else {
      res.status(400).json({ msg: "Sorry, an error occured" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Get all user's notifications
exports.getMynotifications = async (req, res) => {
  try {
    let myNotifs = await User.findById(req.user.id)
      .populate({
        path: "notifications",
        populate: {
          path: "author",
          select: "username slugUsername _id avatar",
        },
      })
      .select("notifications");

    return res.status(200).json({ notifications: myNotifs.notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Get a user's posts
exports.getUsersPosts = async (req, res) => {
  try {
    let queriedSlug;

    if (req.user.slugUsername !== req.params.slugUsername) {
      // searching for another user's profile
      queriedSlug = req.params.slugUsername;
    } else {
      // searching own profile
      queriedSlug = req.user.slugUsername;
    }

    let results = await searchUsersPostsAndImages(queriedSlug);

    if (results.type !== "success") {
      return res.status(400).json({ msg: results.msg });
    } else {
      return res.status(200).json({ posts: results.content });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Sorry, an error occured" });
  }
};

// Register as a new user
exports.registerNewUser = async (req, res) => {
  // CHECK FOR VALIDATION ERRORS
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // CHECK IF EMAIL IS TAKEN
    let user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).json({ msg: "Email already taken" });
    }

    // CHECK IF SLUGIFIED USERNAME IS TAKEN
    user = await User.findOne({
      slugUsername: slugify(username, { lower: true }),
    });

    if (user) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // CREATE USER
    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // ACTUAL USER CREATION
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      jwtSecretKey,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send(
        "We are sorry, the server encountered an internal error during profile creation"
      );
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "No user with this email" });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      //config.get("jwtSecret"),
      jwtSecretKey,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    return res.status(500).json({
      msg: "Sorry, the server ran into an error during your authentication",
    });
  }
};

// Get a user's informations
exports.getUserInfo = async (req, res) => {
  try {
    let user = await User.findById(req.user.id)
      .select("-password -email")
      .populate("friends", "id username slugUsername avatar");

    if (!user) {
      return res.status(400).json({ msg: "Sorry, this user doesn't exist" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Sorry, an error occured" });
  }
};

// See a user's profile
exports.getUserProfile = async (req, res) => {
  try {
    let user;

    if (req.user.slugUsername === req.params.slugUsername) {
      // user is seeing their own profile

      user = await User.findOne({ slugUsername: req.params.slugUsername })
        .select("-password")
        .populate("friends", "id username slugUsername avatar");
    } else {
      // user is seeing another user's profile

      user = await User.findOne({ slugUsername: req.params.slugUsername })
        .select("avatar id username slugUsername joinDate")
        .populate("friends", "id username slugUsername avatar");
    }

    if (!user) {
      return res.status(400).json({ msg: "Sorry, this user doesn't exist" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({
      msg:
        "We are sorry, the server encountered an internal error during the update",
    });
  }
};

// update a user
exports.updateUser = async (req, res) => {
  // CHECK FOR VALIDATION ERRORS
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ msg: "Sorry, this user doesn't exist" });
    }

    let updatedUser = {
      username: username,
    };

    User.findByIdAndUpdate(req.user, updatedUser, { new: true })
      .select("-password -email")
      .populate("friends", "id username slugUsername avatar")
      .exec((err, updatedUser) => {
        if (err) throw err;
        return res.status(200).json({ msg: "Success", updatedUser });
      });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send(
        "We are sorry, the server encountered an internal error during the update"
      );
  }
};

// update a user's theme
exports.updateUserTheme = async (req, res) => {
  // CHECK FOR VALIDATION ERRORS
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const allowedThemes = ["spring", "summer", "autumn", "winter"];

  const { newTheme } = req.body;

  if (!allowedThemes.includes(newTheme)) {
    return res.status(400).json({
      msg:
        "This theme is not supported. Must be Spring, Summer, Autumn or Winter!",
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ msg: "Sorry, this user doesn't exist" });
    }

    const updatedTheme = {
      theme: newTheme,
    };

    User.findByIdAndUpdate(req.user, updatedTheme, (err, result) => {
      if (err) throw err;

      return res.status(200).json({ msg: "Success", newTheme });
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send(
        "We are sorry, the server encountered an internal error during the update"
      );
  }
};

// update a user's avatar
exports.updateAvatar = async (req, res) => {
  try {
    // check if file exists
    if (req.file) {
      photo = req.file.filename;
    } else {
      return res.status(400).json({ msg: "An error occured with the image" });
    }

    // check if user still exists
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json();
    }

    // delete old image
    if (
      req.user.avatar != "defaultAvatar.jpg" &&
      fs.existsSync(`public/img/users/avatars/${req.user.avatar}`)
    ) {
      try {
        fs.unlinkSync(`public/img/users/avatars/${req.user.avatar}`);
      } catch (err) {
        console.error(err);
      }
    }

    // Update user's avatar in database
    let updatedUserAvatar = {
      avatar: photo,
    };

    User.findByIdAndUpdate(
      req.user,
      updatedUserAvatar,
      { new: true, select: "-password" },
      (err, updatedUser) => {
        if (err) throw err;

        return res.status(200).json({ msg: "Success", updatedUser });
      }
    );
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send(
        "We are sorry, the server encountered an internal error during the update"
      );
  }
};

// search for users according to query
exports.searchUsers = async (req, res) => {
  try {
    const { query } = { ...req.body };

    slugQuery = slugify(query, { lower: true });

    let regexedQuery = new RegExp(query, "i");

    const queryResults = await User.find(
      { $or: [{ username: regexedQuery }, { slugUsername: slugQuery }] },
      "_id username slugUsername avatar"
    ).sort({ username: 1, slugUsername: 1 });

    return res.status(200).json({ queryResults });
  } catch (err) {
    res.status(500).json({
      msg: "We are sorry, the server encountered an internal error",
    });
  }
};
