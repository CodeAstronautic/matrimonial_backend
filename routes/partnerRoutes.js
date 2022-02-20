const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Partner = require("../models/lifeParner");
const auth = require("../middlewares/auth");
const User = require("../models/user");

router.post("/partner", auth, async (req, res) => {
  const { age, height, maritalStatus, religion, community, motherTongue } =
    req.body;

  const { userId } = req.tokenUser;

  const partner = new Partner({
    age: age,
    height: height,
    maritalStatus: maritalStatus,
    religion: religion,
    community: community,
    motherTongue: motherTongue,
    userId: mongoose.Types.ObjectId(userId),
  });
  console.log(partner);
  partner
    .save()
    .then((result) => {
      console.log(result, "result");
      return res.json(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/getpartner/:id", async (req, res) => {
  const userById = await Partner.findOne({
    _id: req.params.id.toString(),
  });
  res.send(userById);
});

router.get("/getpartners", async (req, res) => {
  const userById = await Partner.find();
  console.log(userById, "new");
  res.send(userById);
});

router.get("/filter", async (req, res) => {
  const filters = req.query;
  console.log(filters);
  const userById = await User.findById(filters?.id);
  console.log(userById, "useruser");

  res.json(userById);
});

router.get("/basic-search", async (req, res) => {
  var filters = req.query;
  const userById = await User.find();
  // console.log(userById[userById.length-1], "useruser");
  // console.log("filteredUsers", filters)

  const AgefilteredUsers = userById.filter((user) => {
    // console.log(user, user.Age == filters?.age)
    if (
      parseInt(user?.BasicsAndLifestyle[0]?.Age) >= parseInt(filters?.age) &&
      parseInt(user?.BasicsAndLifestyle[0]?.Age) <= parseInt(filters?.ageTo)
    ) {
      return true;
    }
  });

  const MotherTongueFilteredUsers = AgefilteredUsers.filter((user) => {
    // console.log(user, user.Age == filters?.age)

    if (
      user?.ReligiousBackground[0]?.MotherTongue?.toUpperCase() ==
      filters?.motherTongue?.toUpperCase()
    ) {
      return true;
    }
  });
  const MaritalStatusFilteredUsers = MotherTongueFilteredUsers.filter(
    (user) => {
      // console.log(user, user.Age == filters?.age)
      if (
        user?.BasicsAndLifestyle[0]?.MaritalStatus == filters?.maritalStatus
      ) {
        return true;
      }
    }
  );
  res.json(MaritalStatusFilteredUsers);
});

router.get("/advance-search", async (req, res) => {
  const filters = req.query;
  const userById = await User.find();
  const AgefilteredUsers = userById.filter((user) => {
    // console.log(user, user.Age == filters?.age)
    if (
      parseInt(user?.BasicsAndLifestyle[0]?.Age) >= parseInt(filters?.age) &&
      parseInt(user?.BasicsAndLifestyle[0]?.Age) <= parseInt(filters?.ageTo)
    ) {
      return true;
    }
  });

  const MotherTongueFilteredUsers = AgefilteredUsers.filter((user) => {
    // console.log(user, user.Age == filters?.age)

    if (
      user?.ReligiousBackground[0]?.MotherTongue?.toUpperCase() ==
      filters?.motherTongue?.toUpperCase()
    ) {
      return true;
    }
  });
  const MaritalStatusFilteredUsers = MotherTongueFilteredUsers.filter(
    (user) => {
      // console.log(user, user.Age == filters?.age)
      if (
        user?.BasicsAndLifestyle[0]?.MaritalStatus == filters?.maritalStatus
      ) {
        return true;
      }
    }
  );
  const LocationUserFiltered = MaritalStatusFilteredUsers.filter((user) => {
    // console.log(user, user.Age == filters?.age)
    if (
      user?.LocationofGroom[0]?.StateofResidence == filters?.StateofResidence
    ) {
      return true;
    }
  });
  const FamilyFilterd = LocationUserFiltered.filter((user) => {
    // console.log(user, user.Age == filters?.age)
    if (user?.Familydetails[0]?.FatherStatus == filters?.FatherStatus) {
      return true;
    }
  });
  res.json(FamilyFilterd);
});

module.exports = router;
