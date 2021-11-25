require("dotenv").config();
const express = require("express");
const request = require("request");
const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const router = express.Router();
const auth = require("../../middlewere/auth");
const Profile = require("../../models/profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const { response } = require("express");

//@route   GET api/profile/me
//@desc    Get Current users profile
//@access  Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



// @route   POST api/profile
// @desc    Create or Update profile
// @access  Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Bulid profile object
    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (company) profileFeilds.company = company;
    if (website) profileFeilds.website = website;
    if (location) profileFeilds.location = location;
    if (bio) profileFeilds.bio = bio;
    if (status) profileFeilds.status = status;
    if (githubusername) profileFeilds.githubusername = githubusername;
    if (skills) {
      profileFeilds.skills = skills.split(",").map((skill) => skill.trim());
    }
    // Build social object
    profileFeilds.social = {};
    if (youtube) profileFeilds.social.youtube = youtube;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (linkedin) profileFeilds.social.linkedin = linkedin;
    if (instagram) profileFeilds.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // console.log(profile);
      if (profile) {
        //Update
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFeilds },
          { new: true }
        );
        return res.json(profile);
      }
      // Create

      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);


//@route   GET api/profile
//@desc    Get All Profiles
//@access  Public

router.get('/all', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
    console.log(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//@route   GET api/profile/user/user_id
//@desc    Get  Profiles By User ID
//@access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res
        .status(400)
        .json({ message: "There is no profile for this user." });
    }
    res.json(profile);
  } catch (err) {
    if (err.kind == "ObjectId") {
      return res
        .status(400)
        .json({ message: "There is no profile for this user." });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route   DELETE api/profile
//@desc    Delete User And Profiles
//@access  Private

router.delete("/", auth, async (req, res) => {
  try {
    //  delete users posts
    await Post.deleteMany({ user: req.user.id });
    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User is Removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route    PUT api/profile/experience
// @desc     Add experience in profile
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is empty").not().isEmpty(),
      check("company", "Company name is empty").not().isEmpty(),
      check("from", "from date is empty").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // console.log(profile);
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("server error");
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience in profile
// @access   Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get index for remove
    const removeIndex = profile.experience
      .map((item) => item)
      .indexOf(req.params.exp_id);

    await profile.experience.splice(removeIndex, 1);
    profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("server error");
  }
});

// @route    PUT api/profile/education
// @desc     Add education in profile
// @access   Private
router.put(
  "/education",
  [
    auth,
    [
      check("degree", "Title is required").not().isEmpty(),
      check("fieldofstudy", "fieldofstudy  is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // console.log(profile);
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("server error");
    }
  }
);

// @route    DELETE api/profile/education/:exp_id
// @desc     Delete education in profile
// @access   Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get index for remove
    const removeIndex = profile.education
      .map((item) => item)
      .indexOf(req.params.edu_id);

    await profile.education.splice(removeIndex, 1);
    profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("server error");
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=
      5&sort=created:asc&client_id=${process.env.github_CLIENT_ID}&client_secret=${process.env.github_CLIENT_SECRET}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode != 200) {
        res.status(404).json({ msg: "No Github Profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: "No Github profile found" });
  }
});

module.exports = router;
