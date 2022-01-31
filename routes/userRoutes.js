const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const multer = require("multer");

// image parsing / storing
const path = require("path");
const crypto = require("crypto");
const methodOverride = require("method-override");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const Grid = require("gridfs-stream");

///////////// IMAGE STUFF
router.use(methodOverride("_method"));

const conn = mongoose.createConnection(
  "mongodb+srv://pooja1012:zZp5MO7JTvgz57Yq@cluster0.ppwwi.mongodb.net/Matrimonial?retryWrites=true&w=majority"
);
// Init gfs
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});
// create storage engine
const storage = new GridFsStorage({
  url: "mongodb+srv://pooja1012:zZp5MO7JTvgz57Yq@cluster0.ppwwi.mongodb.net/Matrimonial?retryWrites=true&w=majority",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

// create storage

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "/uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const upload = multer({ storage: storage });

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
        email: email,
        maritalState: maritalState,
        contactDetails: {
          state: req.body.contactDetails && req.body.contactDetails.state,
          Country: req.body.contactDetails && req.body.contactDetails.Country,
          city: req.body.contactDetails && req.body.contactDetails.city,
        },
        EducationAndCareer: {
          HighestQualification:
            req.body.EducationAndCareer &&
            req.body.EducationAndCareer.HighestQualification,
          WorkingAs:
            req.body.EducationAndCareer &&
            req.body.EducationAndCareer.WorkingAs,
          AnnualIncome:
            req.body.EducationAndCareer &&
            req.body.EducationAndCareer.AnnualIncome,
          Workingwith:
            req.body.EducationAndCareer &&
            req.body.EducationAndCareer.Workingwith,
          ProfessionalArea:
            req.body.EducationAndCareer &&
            req.body.EducationAndCareer.ProfessionalArea,
        },
        BasicsAndLifestyle: {
          Age: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Age,
          DateofBirth: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.DateofBirth,
          MaritalStatus: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.MaritalStatus,
          Height: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Height,
          Grewupin: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Grewupin,
          Diet: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Diet,
          PersonalValues: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.PersonalValues,
          SunSign: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.SunSign,
          BloodGroup: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.BloodGroup,
          Heal: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Heal,
        },
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
      console.log(file, "filefilefilefile");
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.tokenUser.userId },
        {
          profilePicId: file.filename,
        },
        { new: true }
      );
      console.log(updatedUser, "updatedUser");
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
