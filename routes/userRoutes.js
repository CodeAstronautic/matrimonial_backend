const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const multer = require("multer");

// create storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// get all users

router.get("/users", async (req, res) => {
  const allUsers = await User.find().select("-password");
  res.send(allUsers);
});

// get user by id

router.get("/getuser/:userid", async (req, res) => {
  const userById = await User.findOne({
    _id: req.params.userid.toString(),
  }).select("-password");
  res.send(userById);
});

// get auth info

router.get("/getauth", auth, async (req, res) => {
  User.findOne({ _id: mongoose.Types.ObjectId(req.tokenUser.userId) })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(444).send(error);
    });
});

// register new user

router.post("/register", async (req, res) => {
 
  if (req.body.password.length < 6) {
    return res.json({ err: "Password must be at least 6 characters" });
  }
  if (req.body.name.length < 4 || req.body.name.length > 12) {
    return res.json({ err: "Name must be between 4 and 12 characters" });
  }
  if (!req.body.email.includes("@") || !req.body.email.includes(".")) {
    return res.json({ err: "Email input invalid" });
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.json({ err: "Profile with this email already exists" });
  }

  // hash password

  const hashedPw = await bcrypt.hash(req.body.password, 12);

  const newUser = new User({
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    password: hashedPw,
  });

  newUser
    .save()
    .then((result) => {
      res.json(result);
    })

    .catch((err) => {
      res.status(400).send(err);
    });
});

// user login

router.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.send({ err: "all fields required" });
  }
  User.findOne({ email: req.body.email }, async function (err, user) {
    if (err) {
      return res.json({
        err: "Sorry, there is an issue with connecting to the database. We are working on fixing this.",
      });
    } else {
      if (!user) {
        return res.json({ err: "No user found with this email" });
      }
      const passwordsMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordsMatch) {
        const token = jwt.sign(
          {
            tokenUser: {
              userId: user._id,
              email: user.email,
               name: user.name
            },
          },
          "local development secret",
          { expiresIn: "3hr" }
        );

        const userInfo = {
          age: user.age,
          city: user.city,
          name: user.name,
          email: user.email,
          profilePicId: user.profilePicId,
          coverPicId: user.coverPicId,
          _id: user._id,
        };

        res.json({
          status: "success",
          message: "Login successful",
          data: {
            user: userInfo,
            token,
          },
        });
      } else {
        return res.json({ err: "Incorrect password" });
      }
    }
  });
});

//    update user

router.post("/edituser", auth, async (req, res) => {
  const {
    name,
    email,
    password,
    maritalState,
    Age,
    Religion,
    MotherTongue,
    locaion,
    Height,
    dateOfBirth,
    Diet,
    sunSign,
    Heal,
  } = req.body;
  const { userId } = req.tokenUser;
  console.log(userId);
  const foundUser = await User.findOne({
    _id: mongoose.Types.ObjectId(userId),
  });
  console.log(foundUser, "foundUserfoundUser");
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(userId),
    },
    {
      $set: {
        name: name,
        email: email.toLowerCase(),
        maritalState: maritalState,
        state: req.body.contactDetails.state,
        Country: req.body.contactDetails.Country,
        city: req.body.contactDetails.city,
        Religion: Religion,
        Age: Age,
        MotherTongue: MotherTongue,
        locaion: locaion,
        Height: Height,
        dateOfBirth: dateOfBirth,
        Diet: Diet,
        sunSign: sunSign,
        Heal: Heal,
      },
    },
    { new: true }
  )
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

//            get user

router.post(
  "/editprofilepic/",
  auth,
  upload.single("image"),
  async (req, res) => {
    gfs.files.findOne({ _id: req.file.id }, async (err, file) => {
      if (!file || file.length === 0) {
        return res
          .status(404)
          .json({ err: "no file exists, file upload failed" });
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.tokenUser.userId },
        {
          profilePicId: file._id,
        },
        { new: true }
      );
      return res.json(updatedUser);
    });
  }
);
router.get("/user/:id", async (req, res) => {
  const userId = req.params;
  const foundUser = await User.findOne({ _id: userId });
  if (!foundUser) {
    res.status(404).send("User not found");
  } else {
    res.status(200).send(foundUser);
  }
});

module.exports = router;
