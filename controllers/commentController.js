// COMMENTS are not used in this version

const { validationResult } = require("express-validator");

const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Image = require("../models/Image");

// Comment on a post or image
// Needs ?mode=post or ?mode=image
// /!\ to use the req.query, here ?mode=post ou ?mode=image
exports.createComment = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.Status(400).json({ errors: errors.array() });
  }

  const { content } = req.body;
  const { mode } = req.query;

  try {
    if (mode === "image") {
      const imageExists = await Image.exists({ _id: req.params.id });

      if (!imageExists) {
        return res
          .status(400)
          .json({ msg: "This image doesn't seem to exist anymore" });
      }

      let newComment = new Comment({
        content,
        author: req.user.id,
        associatedImage: req.params.id,
      });

      newComment.save((err, newComment) => {
        if (err) {
          throw err;
        }

        return res.status(200).json({ newComment });
      });
    } else if (mode === "post") {
      const postExists = await Post.exists({ _id: req.params.id });

      if (!postExists) {
        return res
          .status(400)
          .json({ msg: "This post doesn't seem to exist anymore" });
      }

      let newComment = new Comment({
        content,
        author: req.user.id,
        associatedPost: req.params.id,
      });

      newComment.save((err, newComment) => {
        if (err) {
          throw err;
        }

        return res.status(200).json({ newComment });
      });
    } else {
      res.status(400).json({ msg: "You cannot comment on this" });
    }
  } catch (err) {
    return res
      .status(500)
      .send("We are sorry, the server encountered an internal error");
  }
};

// Edit a comment
exports.editComment = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.Status(400).json({ errors: errors.array() });
  }

  const { content } = req.body;
  const { mode } = req.query;

  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(400).json({ msg: "Comment not found" });
  }

  if (comment.author != req.user.id) {
    return res.status(400).json({ msg: "Edition unauthorized for this user" });
  }

  updatedComment = {
    dateEdited: Date.now(),
    content: content,
    edited: true,
  };

  Comment.findByIdAndUpdate(
    req.params.id,
    updatedComment,
    { new: true },
    (err, newComment) => {
      if (err) throw err;

      return res.status(200).json({ msg: "Success", newComment });
    }
  );
};

// Not perfect
// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    // check if comment still exists
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(400).json({ msg: "This comment does not exist" });
    }

    // comment is for an image
    if (comment.associatedImage) {
      // check if image still exists
      let image = await Image.findById(comment.associatedImage).populate(
        "author",
        "id"
      );

      // if image doesn't exist anymore, delete comment, which should have been deleted with the image
      if (!image) {
        Comment.findByIdAndRemove(req.params.id, (err, removedDoc) => {
          if (err) throw err;

          return res.status(200).json({ msg: "comment removed" });
        });

        return res.status(200).json({
          msg: "The associated image does not exist anymore. Comment deleted",
        });
      }

      // only comment author and image author can delete a regular comment
      if (comment.author !== req.user.id && image.author.id !== req.user.id) {
        return res.status(400).json({ msg: "Unauthorized for this user" });
      }

      // remove associated notifications
      Notification.deleteMany(
        { associatedComment: req.params.id },
        (err, result) => {
          if (err) throw err;

          console.log(result);
        }
      );

      Comment.findByIdAndRemove(req.params.id, (err, removedDoc) => {
        if (err) throw err;

        return res.status(200).json({ msg: "comment removed" });
      });
    } else if (comment.associatedPost) {
      // comment is for a post

      let post = await Post.findById(comment.associatedPost).populate(
        "author",
        "id"
      );

      if (!post) {
        Comment.findByIdAndRemove(req.params.id, (err, removedDoc) => {
          if (err) throw err;

          return res.status(200).json({ msg: "comment removed" });
        });

        return res
          .status(400)
          .json({ msg: "The associated post does not exist anymore" });
      }

      // only comment author and post author can delete the comment
      if (comment.author !== req.user.id && post.author.id !== req.user.id) {
        return res.status(400).json({ msg: "Unauthorized for this user" });
      }

      // remove associated notifications
      Notification.deleteMany(
        { associatedComment: req.params.id },
        (err, result) => {
          if (err) throw err;

          console.log(result);
        }
      );

      Comment.findByIdAndRemove(req.params.id, (err, removedDoc) => {
        if (err) throw err;

        return res.status(200).json({ msg: "comment removed" });
      });
    } else {
      return res.status(400).json({ msg: "This mode is not allowed" });
    }
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Like comment
exports.likeComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id).populate(
      "author",
      "id"
    );

    // check if comment exists
    if (!comment) {
      return res.status(400).json({ msg: "This comment doesn't exist" });
    }

    // check if user likes their own comment
    if (req.user.id == comment.author.id) {
      return res.status(400).json({ msg: "You cannot like your own comment" });
    }

    // check if user already liked
    if (comment.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: "You cannot like a comment twice" });
    }

    // update the comment's likes
    let updatedLikes = {
      likes: [...comment.likes, req.user.id],
    };

    Comment.findByIdAndUpdate(req.params.id, updatedLikes, (err) => {
      if (err) throw err;
    });

    // send the author a notification
    let likeNotif = new Notification({
      notifType: "like_comment",
      author: req.user,
      target: comment.author,
      associatedComment: req.params.id,
    });

    likeNotif.save();

    return res.status(200).json({ msg: "Liked" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Unlike comment
exports.unlikeComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id).populate(
      "author",
      "id"
    );

    // check if comment exists
    if (!comment) {
      return res.status(400).json({ msg: "This comment doesn't exist" });
    }

    // check if user is relevant
    if (req.user.id == comment.author.id) {
      return res
        .status(400)
        .json({ msg: "You cannot unlike your own comment" });
    }

    // check if user did like the comment
    if (!comment.likes.includes(req.user.id)) {
      return res.status(400).json({
        msg: "You cannot unlike a comment you didn't like in the first place",
      });
    }

    // check if like notification was read
    let relevantNotif = await Notification.findOne({
      wasRead: false,
      author: req.user.id,
      associatedComment: comment.id,
      target: comment.author.id,
      notifType: "like_comment",
    });

    // Delete like notification if unread
    if (relevantNotif) {
      Notification.findByIdAndRemove(relevantNotif.id, (err) => {
        if (err) throw err;
      });
    }

    // remove like from comment's likes
    let updatedLikes = comment.likes.filter((id) => {
      id != req.user.id;
    });

    Comment.findByIdAndUpdate(req.params.id, { likes: updatedLikes }, (err) => {
      if (err) throw err;
    });

    return res.status(200).json({ msg: "Unliked" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};
