// THOSE ROUTES ARE VALID BUT NOT USED IN THIS VERSION

const express = require("express");

const commentController = require("../controllers/commentController");
const { protect } = require("../middlewares/auth");
const { check } = require("express-validator");

const router = express.Router();

// Like/Unlike a comment
router
  .route("/like/:id")
  .post(protect, commentController.likeComment)
  .delete(protect, commentController.unlikeComment);

// Post/Edit/Delete a comment
router
  .route("/:id")
  .post(
    protect,
    [check("content", "A comment cannot be empty").not().isEmpty()],
    commentController.createComment
  )
  .patch(
    protect,
    [check("content", "A post cannot be empty").not().isEmpty()],
    commentController.editComment
  )
  .delete(protect, commentController.deleteComment);

module.exports = router;
