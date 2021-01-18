const Image = require("../models/Image");
const Post = require("../models/Post");
const User = require("../models/User");

exports.searchUsersPostsAndImages = async (currentUser) => {
  try {
    // currentUser must be a slug
    const userToFeed = await User.findOne({ slugUsername: currentUser });

    if (!userToFeed) {
      return {
        type: "error",
        msg:
          "We are sorry, an error occured during user identification. Your posts and images couldn't be loaded.",
      };
    }

    let imagePart = await Image.find({
      author: userToFeed,
    })
      .populate("likes", "username")
      .populate("author", "username slugUsername");

    let postPart = await Post.find({
      author: userToFeed,
    })
      .populate("likes", "username")
      .populate("author", "username slugUsername");

    let totalResults = postPart.concat(imagePart);

    totalResults.sort(function (a, b) {
      if (
        (a.dateEdited ? a.dateEdited : a.datePosted) >
        (b.dateEdited ? b.dateEdited : b.datePosted)
      )
        return -1;

      if (
        (a.dateEdited ? a.dateEdited : a.datePosted) <
        (b.dateEdited ? b.dateEdited : b.datePosted)
      )
        return 1;
    });

    return { type: "success", content: totalResults };
  } catch (err) {
    console.error(err);
    return { type: "error", msg: "Sorry, an error occured" };
  }
};
