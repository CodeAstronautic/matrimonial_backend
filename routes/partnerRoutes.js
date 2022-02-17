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

router.get("/getpartner/:id", async(req, res) => {
    const userById = await Partner.findOne({
        _id: req.params.id.toString(),
    })
    res.send(userById);
});

router.get('/getpartners', async (req, res) => {
	const userById = await Partner.find();
	console.log(userById, 'new');
	res.send(userById);
});
router.get('/filter', async (req, res) => {
	const filters = req.query;
	const userById = await Partner.find();
	console.log(filters, 'kjdlkfgjd');
	const filteredUsers = userById.filter((user) => {
		console.log(user.maritalStatus == filters, filters, 'user.maritalStatus==filtersuser.maritalStatus==filters');
		if (
			user.maritalStatus == filters.maritalStatus ||
			(user.age.from >= filters.from && user.age.to <= filters.to)
		) {
			return true;
		}
	});
	res.json(filteredUsers);
});

module.exports = router
