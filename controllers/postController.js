const { validationResult } = require("express-validator");

const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Create a post
exports.createPost = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.Status(400).json({ errors: errors.array() });
  }

  const { content } = req.body;

  try {
    let newPost = new Post({
      content,
      author: req.user.id,
    });

    newPost.save((err, newPost) => {
      if (err) {
        throw err;
      }

      return res.status(200).json({ newPost });
    });
  } catch (err) {
    return res
      .status(500)
      .send("We are sorry, the server encountered an internal error");
  }
};

// Get an individual post
exports.getPost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).populate(
      "author likes",
      "username id"
    );

    if (!post) {
      return res.status(400).json({ msg: "This post does not exist" });
    }

    return res.status(200).json({
      post,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Edit a post
exports.editPost = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.Status(400).json({ errors: errors.array() });
  }

  const { content } = req.body;

  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    }

    if (post.author != req.user.id) {
      return res
        .status(400)
        .json({ msg: "Edition unauthorized for this user" });
    }

    updatedPost = {
      dateEdited: Date.now(),
      content: content,
      edited: true,
    };

    Post.findByIdAndUpdate(
      req.params.id,
      updatedPost,
      { new: true },
      (err, newPost) => {
        if (err) throw err;

        return res.status(200).json({ msg: "Success", newPost });
      }
    );
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: "This post does not exist" });
    }

    if (post.author != req.user.id) {
      return res.status(400).json({ msg: "Unauthorized for this user" });
    }

    // remove associated notifications
    Notification.deleteMany(
      { associatedPost: req.params.id },
      (err, result) => {
        if (err) throw err;
      }
    );

    // remove associated comments
    Comment.deleteMany({ associatedPost: req.params.id }, (err, result) => {
      if (err) throw err;
    });

    Post.findByIdAndRemove(req.params.id, (err, removedDoc) => {
      if (err) throw err;

      return res.status(200).json({ msg: "Post removed" });
    });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).populate("author");

    if (!post) {
      return res.status(400).json({ msg: "This post doesn't exist" });
    }

    if (req.user.id == post.author.id) {
      return res.status(400).json({ msg: "You cannot like your own post" });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: "You cannot like a post twice" });
    }

    // update the post's likes
    let updatedLikes = {
      likes: [...post.likes, req.user.id],
    };

    Post.findByIdAndUpdate(req.params.id, updatedLikes, (err) => {
      if (err) throw err;
    });

    // send the author a notification
    let likeNotif = new Notification({
      notifType: "like",
      author: req.user,
      target: post.author,
      associatedPost: req.params.id,
    });

    likeNotif.save();

    return res.status(200).json({ msg: "Liked" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).populate("author");

    // check post still exists
    if (!post) {
      return res.status(400).json({ msg: "This post doesn't exist" });
    }

    // check user is relevant
    if (req.user.id == post.author.id) {
      return res.status(400).json({ msg: "You cannot unlike your own post" });
    }

    // check user did like the post
    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({
        msg: "You cannot unlike a post you didn't like in the first place",
      });
    }

    // check if like notification was read
    let relevantNotif = await Notification.findOne({
      wasRead: false,
      author: req.user.id,
      associatedPost: post.id,
      target: post.author.id,
      notifType: "like",
    });

    // Delete like notification if unread
    if (relevantNotif) {
      Notification.findByIdAndRemove(relevantNotif.id, (err) => {
        if (err) throw err;
      });
    }

    // remove like from post's likes
    let updatedLikes = post.likes.filter((id) => {
      id != req.user.id;
    });

    Post.findByIdAndUpdate(req.params.id, { likes: updatedLikes }, (err) => {
      if (err) throw err;
    });

    return res.status(200).json({ msg: "Unliked" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};
