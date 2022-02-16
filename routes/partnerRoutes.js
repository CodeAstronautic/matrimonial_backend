const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Partner = require("../models/lifeParner");
const auth = require("../middlewares/auth");


router.post("/partner", auth, async(req, res) => {
    const {
        age,
        height,
        maritalStatus,
        religion,
        community,
        motherTongue
    } = req.body;

    const { userId } = req.tokenUser;

    const partner = new Partner({
        age: age,
        height: height,
        maritalStatus: maritalStatus,
        religion: religion,
        community: community,
        motherTongue: motherTongue,
        userId: mongoose.Types.ObjectId(userId)
    })
    console.log(partner)
    partner.save().then((result) => {
        console.log(result,"result")
        return res.json(result)
    }).catch((err) => {
        res.status(400).send(err);
    });

})

module.exports = router