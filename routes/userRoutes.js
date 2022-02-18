const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const multer = require("multer");
const MongoClient = require('mongodb').MongoClient;
// image parsing / storing
const path = require("path");
const crypto = require("crypto");
const methodOverride = require("method-override");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const Grid = require("gridfs-stream");
const { Router } = require("express");

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

router.get("/users", async(req, res) => {
    const allUsers = await User.find().select("-password");
    res.send(allUsers);
});

// get user by id

router.get("/getuser/:userid", async(req, res) => {
    console.log(req.params.userid)
    const userById = await User.findOne({
        _id: req.params.userid.toString(),
    });
   
    res.send(userById);
});

// get auth info

router.get("/getauth", auth, async(req, res) => {
    User.findOne({ _id: mongoose.Types.ObjectId(req.tokenUser.userId) })
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((error) => {
            res.status(444).send(error);
        });
});

// register new user

router.post("/register", async(req, res) => {

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
            const token = jwt.sign({
                tokenUser: {
                    userId: result._id,
                    email: result.email,
                    name: result.name
                },
            },
            "local development secret"
        );

        const userInfo = {
            age: result.age,
            city: result.city,
            name: result.name,
            email: result.email,
            profilePicId: result.profilePicId,
            coverPicId: result.coverPicId,
            _id: result._id,
        };

        res.json({
            status: "success",
            message: "Signup successful",
            data: {
                user: userInfo,
                token,
            },
        });
        })

    .catch((err) => {
        res.status(400).send(err);
    });
});

// user login

router.post("/login", async(req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.send({ err: "all fields required" });
    }
    User.findOne({ email: req.body.email }, async function(err, user) {
        if (err) {
            return res.json({
                err: "Sorry, there is an issue with connecting to the database. We are working on fixing this.",
            });
        } else {
            if (!user) {
                return res.json({ status: 401, err: "No user found with this email" });
            }
            const passwordsMatch = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (passwordsMatch) {
                const token = jwt.sign({
                        tokenUser: {
                            userId: user._id,
                            email: user.email,
                            name: user.name
                        },
                    },
                    "local development secret"
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
                return res.send({ status: 401, err: "Incorrect password" });
            }
        }
    });
});

//    update user

router.post("/edituser", auth, async(req, res) => {
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
    const foundUser = await User.findOne({
        _id: mongoose.Types.ObjectId(userId),
    });
    console.log(foundUser , "found",req.body)
    User.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(userId),
        }, {
            $set: {
                name: name|| foundUser.name,
                email: email,
                maritalState: maritalState,
                contactDetails: {
                    state: req.body.contactDetails && req.body.contactDetails.state,
                    Country: req.body.contactDetails && req.body.contactDetails.Country,
                    city: req.body.contactDetails && req.body.contactDetails.city,
                },
                EducationAndCareer: {
                    HighestQualification: req.body.EducationAndCareer &&req.body.EducationAndCareer.HighestQualification || foundUser.EducationAndCareer[0]?.HighestQualification,
                    WorkingAs: req.body.EducationAndCareer &&
                        req.body.EducationAndCareer.WorkingAs || foundUser.EducationAndCareer[0]?.WorkingAs,
                    AnnualIncome: req.body.EducationAndCareer &&
                        req.body.EducationAndCareer.AnnualIncome || foundUser.EducationAndCareer[0]?.AnnualIncome,
                    Workingwith: req.body.EducationAndCareer &&
                        req.body.EducationAndCareer.Workingwith || foundUser.EducationAndCareer[0]?.Workingwith,
                    ProfessionalArea: req.body.EducationAndCareer &&
                        req.body.EducationAndCareer.ProfessionalArea || foundUser.EducationAndCareer[0]?.ProfessionalArea,
                },
                BasicsAndLifestyle: {
                    Age: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Age|| foundUser.BasicsAndLifestyle[0]?.Age,
                    DateofBirth: req.body.BasicsAndLifestyle &&
                        req.body.BasicsAndLifestyle.DateofBirth||foundUser.BasicsAndLifestyle[0]?.DateofBirth,
                    MaritalStatus: req.body.BasicsAndLifestyle &&
                        req.body.BasicsAndLifestyle.MaritalStatus||foundUser.BasicsAndLifestyle[0]?.MaritalStatus,
                    Height: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Height||foundUser.BasicsAndLifestyle[0]?.Height,
                    Grewupin: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Grewupin||foundUser.BasicsAndLifestyle[0]?.Grewupin,
                    Diet: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Diet||foundUser.BasicsAndLifestyle[0]?.Diet,
                    PersonalValues: req.body.BasicsAndLifestyle &&
                        req.body.BasicsAndLifestyle.PersonalValues||foundUser.BasicsAndLifestyle[0]?.PersonalValues,
                    SunSign: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.SunSign||foundUser.BasicsAndLifestyle[0]?.SunSign,
                    BloodGroup: req.body.BasicsAndLifestyle &&
                        req.body.BasicsAndLifestyle.BloodGroup||foundUser.BasicsAndLifestyle[0]?.BloodGroup,
                    Heal: req.body.BasicsAndLifestyle && req.body.BasicsAndLifestyle.Heal||foundUser.BasicsAndLifestyle[0]?.Heal,
                },
                ReligiousBackground: {
                    Religion: req.body.ReligiousBackground &&
                        req.body.ReligiousBackground.Religion||foundUser.ReligiousBackground[0]?.Religion,
                    Community: req.body.ReligiousBackground &&
                        req.body.ReligiousBackground.Community||foundUser.ReligiousBackground[0]?.Community,
                    SubCommunity: req.body.ReligiousBackground &&
                        req.body.ReligiousBackground.SubCommunity||foundUser.ReligiousBackground[0]?.SubCommunity,
                    MotherTongue: req.body.ReligiousBackground &&
                        req.body.ReligiousBackground.MotherTongue||foundUser.ReligiousBackground[0]?.MotherTongue,
                    CanSpeak: req.body.ReligiousBackground &&
                        req.body.ReligiousBackground.CanSpeak||foundUser.ReligiousBackground[0]?.CanSpeak,
                },
                Familydetails: {
                    FatherStatus: req.body.Familydetails && req.body.Familydetails.FatherStatus||foundUser.Familydetails[0]?.FatherStatus,
                    MotherStatus: req.body.Familydetails && req.body.Familydetails.MotherStatus||foundUser.Familydetails[0]?.MotherStatus,
                    FamilyLocation: req.body.Familydetails && req.body.Familydetails.FamilyLocation||foundUser.Familydetails[0]?.FamilyLocation,
                    NativePlace: req.body.Familydetails && req.body.Familydetails.NativePlace||foundUser.Familydetails[0]?.NoofBrothers,
                    NoofBrothers: req.body.Familydetails && req.body.Familydetails.NoofBrothers||foundUser.Familydetails[0]?.NoofBrothers,
                    NoofSisters: req.body.Familydetails && req.body.Familydetails.NoofSisters||foundUser.Familydetails[0]?.NoofSisters,
                    FamilyType: req.body.Familydetails && req.body.Familydetails.FamilyType||foundUser.Familydetails[0]?.FamilyType,
                    FamilyValues: req.body.Familydetails && req.body.Familydetails.FamilyValues||foundUser.Familydetails[0]?.FamilyValues,
                    FamilyAffluence: req.body.Familydetails && req.body.Familydetails.FamilyAffluence||foundUser.Familydetails[0]?.FamilyAffluence,
                },
                LocationofGroom: {
                    CurrentResidence: req.body.LocationofGroom && req.body.LocationofGroom.CurrentResidence||foundUser.LocationofGroom[0]?.CurrentResidence,
                    StateofResidence: req.body.LocationofGroom && req.body.LocationofGroom.StateofResidence||foundUser.LocationofGroom[0]?.StateofResidence,
                    ResidencyStatus: req.body.LocationofGroom && req.body.LocationofGroom.ResidencyStatus||foundUser.LocationofGroom[0]?.ResidencyStatus,
                    ZipPincode: req.body.LocationofGroom && req.body.LocationofGroom.ZipPincode||foundUser.LocationofGroom[0]?.ZipPincode,
                },
                HobbiesInterestsMore: {
                    Hobbies: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.Hobbies||foundUser.HobbiesInterestsMore[0]?.Hobbies,
                    Interests: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.Interests||foundUser.HobbiesInterestsMore[0]?.Interests,
                    FavouriteMusic: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.FavouriteMusic||foundUser.HobbiesInterestsMore[0]?.FavouriteMusic,
                    FavouriteReads: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.FavouriteReads||foundUser.HobbiesInterestsMore[0]?.FavouriteReads,
                    preferredMovies: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.preferredMovies||foundUser.HobbiesInterestsMore[0]?.preferredMovies,
                    SportsFitnessActivities: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.SportsFitnessActivities||foundUser.HobbiesInterestsMore[0]?.SportsFitnessActivities,
                    FavouriteCusisine: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.FavouriteCusisine||foundUser.HobbiesInterestsMore[0]?.FavouriteCusisine,
                    PreferredDressStyle: req.body.HobbiesInterestsMore && req.body.HobbiesInterestsMore.PreferredDressStyle||foundUser.HobbiesInterestsMore[0]?.PreferredDressStyle,
                },
                BasicInfo: {
                    Age: req.body.BasicInfo && req.body.BasicInfo.Age|| foundUser.BasicInfo[0]?.Age,
                    Height: req.body.BasicInfo && req.body.BasicInfo.Height|| foundUser.BasicInfo[0]?.Height,
                    Religion: req.body.BasicInfo && req.body.BasicInfo.Religion|| foundUser.BasicInfo[0]?.Religion,
                    Mothertongue: req.body.BasicInfo && req.body.BasicInfo.Mothertongue|| foundUser.BasicInfo[0]?.Mothertongue,
                    MaritalStatus: req.body.BasicInfo && req.body.BasicInfo.MaritalStatus|| foundUser.BasicInfo[0]?.MaritalStatus,
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
        }, { new: true })
        .then((result) => {
            console.log(result , "result")
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
    async(req, res) => {
        gfs.files.findOne({ _id: req.file.id }, async(err, file) => {
            if (!file || file.length === 0) {
                return res
                    .status(404)
                    .json({ err: "no file exists, file upload failed" });
            }
            const updatedUser = await User.findOneAndUpdate({ _id: req.tokenUser.userId }, {
                profilePicId: file.filename,
            }, { new: true });
            return res.json(updatedUser);
        });
    }
);

router.get("/:filename", (req, res) => {
    let fileName = req.params.filename;
    let dbName = "Matrimonial";
    //Connect to the MongoDB client
    MongoClient.connect("mongodb+srv://pooja1012:zZp5MO7JTvgz57Yq@cluster0.ppwwi.mongodb.net/Matrimonial?retryWrites=true&w=majority", function(err, client) {
        if (err) {
            return res.send({ title: 'Uploaded Error', message: 'MongoClient Connection error', error: err.errMsg });
        }
        const db = client.db(dbName);

        const collection = db.collection('uploads.files');
        const collectionChunks = db.collection('uploads.chunks');
        collection.find({ filename: fileName }).toArray(function(err, docs) {
            if (docs) {
                collectionChunks.find({ files_id: docs[0] && docs[0]?._id }).sort({ n: 1 }).toArray(function(err, chunks) {
                    if (err) {
                        return res.send({ title: 'Download Error', message: 'Error retrieving chunks', error: err.errmsg });
                    }
                    if (!chunks || chunks.length === 0) {
                        //No data found
                        return res.send({ title: 'Download Error', message: 'No data found' });
                    }
                    //Append Chunks
                    let fileData = [];
                    for (let i = 0; i < chunks.length; i++) {
                        //This is in Binary JSON or BSON format, which is stored
                        //in fileData array in base64 endocoded string format
                        fileData.push(chunks[i].data.toString('base64'));
                    }
                    //Display the chunks using the data URI format
                    let finalFile = 'data:' + docs[0]?.contentType + ';base64,' + fileData.join('');
                    return res.status(200).send(finalFile);
                });
            } else {
                res.json(err)
            }

        });
    });
})
module.exports = router;