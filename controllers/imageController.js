const fs = require("fs");

// models
const Image = require("../models/Image");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Comment = require("../models/Comment");

// Like an image
exports.likeImage = async (req, res) => {
  try {
    let image = await Image.findById(req.params.id).populate("author");

    if (!image) {
      return res.status(400).json({ msg: "This image doesn't exist" });
    }

    if (req.user.id == image.author.id) {
      return res.status(400).json({ msg: "You cannot like your own image" });
    }

    if (image.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: "You cannot like an image twice" });
    }

    // update the image's likes
    let updatedLikes = {
      likes: [...image.likes, req.user.id],
    };

    Image.findByIdAndUpdate(req.params.id, updatedLikes, (err) => {
      if (err) throw err;
    });

    // send the author a notification
    let likeNotif = new Notification({
      notifType: "like_img",
      author: req.user,
      target: image.author,
      associatedImage: req.params.id,
    });

    likeNotif.save();

    return res.status(200).json({ msg: "Liked" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Unlike an image
exports.unlikeImage = async (req, res) => {
  try {
    let image = await Image.findById(req.params.id).populate("author");

    // check image still exists
    if (!image) {
      return res.status(400).json({ msg: "This image doesn't exist" });
    }

    // check user is relevant
    if (req.user.id == image.author.id) {
      return res.status(400).json({ msg: "You cannot unlike your own image" });
    }

    // check user did like the image
    if (!image.likes.includes(req.user.id)) {
      return res.status(400).json({
        msg: "You cannot unlike an image you didn't like in the first place",
      });
    }

    // check if like_img notification was read
    let relevantNotif = await Notification.findOne({
      wasRead: false,
      author: req.user.id,
      associatedImage: image.id,
      target: image.author.id,
      notifType: "like_img",
    });

    // Delete like notification if unread
    if (relevantNotif) {
      Notification.findByIdAndRemove(relevantNotif.id, (err) => {
        if (err) throw err;
      });
    }

    // remove like from image's likes
    let updatedLikes = image.likes.filter((id) => {
      id != req.user.id;
    });

    Image.findByIdAndUpdate(req.params.id, { likes: updatedLikes }, (err) => {
      if (err) throw err;
    });

    return res.status(200).json({ msg: "Unliked" });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// GetImage
exports.getImage = async (req, res) => {
  try {
    let image = await Image.findById(req.params.id).populate(
      "author likes",
      "username slugUsername id"
    );

    // check image still exists
    if (!image) {
      return res.status(400).json({ msg: "This image doesn't exist" });
    }

    return res.status(200).json({ image });
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// upload image as post
exports.createImage = async (req, res) => {
  try {
    //const description = req.body.description;

    // check if file exists
    if (req.file) {
      photo = req.file.filename;
    } else {
      return res.status(400).json({ msg: "An error occured with the image" });
    }

    // check if user still exists
    let user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Sorry, this user doesn't exist anymore" });
    }

    // Create the new post
    let newImagePost = new Image({
      author: req.user,
      image: photo,
      description: req.body.description || null,
    });

    // Save the new post to the database
    newImagePost.save((err, newImagePost) => {
      if (err) {
        throw err;
      }

      return res.status(200).json({ newImagePost });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      msg:
        "We are sorry, the server encountered an internal error during the upload",
    });
  }
};

// Edit an image
exports.editImage = async (req, res) => {
  try {
    let image = await Image.findById(req.params.id);

    if (image.author != req.user.id) {
      return res
        .status(400)
        .json({ msg: "Edition unauthorized for this user" });
    }

    updatedImage = {
      edited: true,
      dateEdited: Date.now(),
      description: req.body.description,
    };

    Image.findByIdAndUpdate(
      req.params.id,
      updatedImage,
      { new: true },
      (err, newImage) => {
        if (err) throw err;

        return res.status(200).json({ msg: "Success", newImage });
      }
    );
  } catch (err) {
    return res.status(500).json({ msg: "Sorry, an internal error occured" });
  }
};

// Delete an image
exports.deleteImage = async (req, res) => {
  try {
    let image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(400).json({ msg: "This image does not exist" });
    }

    if (image.author != req.user.id) {
      return res.status(400).json({ msg: "Unauthorized for this user" });
    }

    // delete image from storage
    if (fs.existsSync(`public/img/users/posts/${image.image}`)) {
      try {
        fs.unlinkSync(`public/img/users/posts/${image.image}`);
      } catch (err) {}
    }

    // remove associated notifications
    Notification.deleteMany(
      { associatedImage: req.params.id },
      (err, result) => {
        if (err) throw err;
      }
    );

    // remove associated comments
    Comment.deleteMany({ associatedImage: req.params.id }, (err, result) => {
      if (err) throw err;
    });

    Image.findByIdAndRemove(req.params.id, (err, removedDoc) => {
      if (err) throw err;
      return res.status(200).json({ msg: "Image removed" });
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send(
        "We are sorry, the server encountered an internal error during the upload"
      );
  }
};

// Read a notification
exports.readNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    // check if notif exists
    if (!notif) {
      return res.status(400).json({ msg: "This notif doesn't exist" });
    }

    // check if is right target
    if (notif.target != req.user.id) {
      return res
        .status(400)
        .json({ msg: "This notif seems to not be directed towards you" });
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
