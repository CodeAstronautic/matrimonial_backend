const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const lifeSchema = {
    age: {
        from: {
            type: String,
            required: false
        },
        to: {
            type: String,
            required: false
        }
    },
    height: {
        feet: {
            type: Number,
            required: false
        },
        inch: {
            type: Number,
            required: false
        }
    },
    maritalStatus: {
        type: String,
        required: false
    },
    religion: {
        type: String,
        required: false
    },
    community: {
        type: String,
        required: false
    },
    motherTongue: {
        type: String,
        required: false
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: 'User'
    }
}

module.exports = mongoose.model("LifePartner", lifeSchema);