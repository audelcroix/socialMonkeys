const express = require("express");
const imageController = require("./../controllers/imageController");

const { check } = require("express-validator");
const { protect } = require("../middlewares/auth");

/// multer ///
const {
  uploadImagePost,
  resizeImagePost,
} = require("../middlewares/uploadImage");

const router = express.Router();

// Post an image
router
  .route("/")
  .post(protect, uploadImagePost, resizeImagePost, imageController.createImage);

// Like/Unlike an image
router
  .route("/like/:id")
  .post(protect, imageController.likeImage)
  .delete(protect, imageController.unlikeImage);

// Read a notification
router
  .route("/readnotification/:id")
  .post(protect, imageController.readNotification);

// Get/Edit/Delete an individual image
router
  .route("/:id")
  .get(imageController.getImage)
  .patch(
    protect,
    [
      check("description", "A description cannot be empty")
        .not()
        .isEmpty()
        .trim()
        .escape(),
    ],
    imageController.editImage
  )
  .delete(protect, imageController.deleteImage);

module.exports = router;
