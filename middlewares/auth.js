const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("config");

const jwtSecretKey = config.get("jwtSecretKey");

exports.protect = async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  // Extract token itself

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") // "Bearer" comes from the front end
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // 2) Verification token

  jwt.verify(token, jwtSecretKey, async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ msg: "Sorry, an error eccoured" });
    }

    // 3) Check if user still exists
    // user is nested in the json sent back to here
    const currentUser = await User.findById(user.user.id)
      .populate("friends", "id")
      .select("-password");

    // Check if token was not altered
    if (!currentUser) {
      return res.status(401).json({ msg: "The user does not exist anymore" });
    }

    // 4) Check if user changed password after the token was issued
    /*   if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  } */
    // Not used in this version

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  });
};
