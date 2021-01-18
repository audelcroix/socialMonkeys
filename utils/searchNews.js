const Image = require("../models/Image");
const Post = require("../models/Post");
const User = require("../models/User");

exports.searchNews = async (currentUser) => {
  try {
    const userToFeed = await User.findById(currentUser).select("id friends");

    if (!userToFeed) {
      return "We are sorry, an error occured during user identification. Your newsfeed couldn't be loaded.";
    }

    let imagePart = await Image.find({
      author: { $in: userToFeed.friends },
    })
      .populate("author", "username slugUsername")
      .limit(20);

    let postPart = await Post.find({
      author: { $in: userToFeed.friends },
    })
      .populate("author", "username slugUsername")
      .limit(20);

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

    return totalResults;
  } catch (err) {
    console.error(err);
    return null;
  }
};
