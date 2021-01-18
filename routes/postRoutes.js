const express = require("express");
const postController = require("./../controllers/postController");

const { check } = require("express-validator");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// Create a post
router
  .route("/")
  .post(
    protect,
    [check("content", "A post cannot be empty").not().isEmpty()],
    postController.createPost
  );

// Like/Unlike a post
router
  .route("/like/:id")
  .post(protect, postController.likePost)
  .delete(protect, postController.unlikePost);

// Get/Edit individual post -- NOT used in this version
router
  .route("/:id")
  .get(postController.getPost)
  .patch(
    protect,
    [check("content", "A post cannot be empty").not().isEmpty()],
    postController.editPost
  )
  .delete(protect, postController.deletePost);

module.exports = router;
