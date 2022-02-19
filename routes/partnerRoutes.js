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
  const userById = await User.find();
  console.log(userById.length, "useruser");

  const filteredUsers = userById.filter((user) => {
    if (
      user.maritalState == filters?.maritalStatus ||
      user.Age == filters?.age ||
      user?.MotherTongue == filters?.motherTongue
    ) {
      return true;
    }
  });
  res.json(filteredUsers);
});

router.get("/basic-search", async (req, res) => {
  const filters = req.query;
  const userById = await User.find();
  console.log(userById.length, "useruser");

  const filteredUsers = userById.filter((user) => {
    if (user.Age == filters?.age) {
      return true;
    }
  });
  res.json(filteredUsers);
});

router.get("/advance-search", async (req, res) => {
  const filters = req.query;
  const userById = await User.find();
  console.log(userById.length, "useruser");

  const filteredUsers = userById.filter((user) => {
    if (user.Age == filters?.age) {
      return true;
    }
  });
  res.json(filteredUsers);
});

module.exports = router;
