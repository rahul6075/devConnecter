const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const auth = require("../../middlewere/auth");
const Profile = require("../../models/profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const { post } = require("request");

//@route   POST api/posts
//@desc    Test route
//@access  Public
router.post(
  "/",
  [auth, [check("text", "text is required.").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors) {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route   GET api/posts
//@desc    Get All Posts
//@access  Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Server error" });
  }
});

//@route   GET api/posts/:id
//@desc    Get  Post By Id
//@access  Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: " Post not found." });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ message: " Post not found." });
    }
    res.status(500).send("Server Error");
  }
});

//@route   DELETE api/posts/:id
//@desc    Delete  Post By Id
//@access  Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: " Post not found." });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: " User is not authorized." });
    }
    await post.remove();
    res.json({ msg: " Post is removed." });
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ message: " Post not found." });
    }
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has yet not been liked" });
    }

    const removeIdx = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIdx, 1);
    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route   POST api/posts/comment/:id
//@desc    Comment on a post
//@access  Public
router.post(
  "/comment/:id",
  [auth, [check("text", "text is required.").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors) {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route   DELETE api/posts/comment/:post_id/:comment_id
//@desc    Delete a Comment on a post
//@access  Public

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out the comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Check comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exists" });
    }

    //check user
    if (comment.user.toString() != req.user.id) {
      return res.status(404).json({ msg: "User  not authorized" });
    }

    const removeIdx = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIdx, 1);
    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ message: " Post not found." });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
