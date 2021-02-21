const express = require("express");

const userController = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const { check } = require("express-validator");

/// required for use of multer ///
const {
  uploadUserAvatar,
  resizeUserAvatar,
} = require("../middlewares/uploadImage");

const router = express.Router();

// Get user's notifications
router
  .route("/mynotifications")
  .get(protect, userController.getMynotifications);

// Get all of user's post
router
  .route("/myposts/:slugUsername")
  .get(protect, userController.getUsersPosts);

// Register as new user
router.route("/register").post(
  [
    check("username", "Username is required")
      .isLength({
        min: 3,
      })
      .trim()
      .escape(),
    check("email", "Please include a valide email").isEmail().normalizeEmail(),
    check("password", "Please enter an 8+ long password")
      .isLength({
        min: 8,
      })
      .trim()
      .escape(),
  ],
  userController.registerNewUser
);

// Login a user
router
  .route("/login")
  .post(
    [
      check("email", "Email invalid").isEmail().normalizeEmail(),
      check("password", "Password required")
        .exists()
        .not()
        .isEmpty()
        .trim()
        .escape(),
    ],
    userController.loginUser
  );

// Get current user's feedback
router.route("/newsfeed").get(protect, userController.getLatestNews);

// Get current user's informations
router.route("/userinfo").get(protect, userController.getUserInfo);

// Update current user's username
router
  .route("/updateusername")
  .post(
    protect,
    [check("username", "Username is required").not().isEmpty().trim().escape()],
    userController.updateUser
  );

// Update current user's theme
router
  .route("/updateusertheme")
  .post(
    protect,
    [check("newTheme", "A theme is required").not().isEmpty().trim().escape()],
    userController.updateUserTheme
  );

// Update current user's avatar
router
  .route("/avatar")
  .patch(
    protect,
    uploadUserAvatar,
    resizeUserAvatar,
    userController.updateAvatar
  );

// Search users by username
router.route("/search").post(protect, userController.searchUsers);

// See a user's profile
router.route("/:slugUsername").get(protect, userController.getUserProfile);

module.exports = router;
