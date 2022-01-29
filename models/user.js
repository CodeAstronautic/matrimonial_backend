const mongoose = require("mongoose");

const userSchema = {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicId: {
    type: String,
  },
  Age: {
    type: String,
  },
  maritalState: {
    type: String,
  },
  Religion: {
    type: String,
  },
  MotherTongue: {
    type: String,
  },
  locaion: {
    type: String,
  },
  Height: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  Diet: {
    type: String,
  },
  sunSign: {
    type: String,
  },
  Heal: {
    type: String,
  },
  contactDetails: [
    {
      Country: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },

    },
  ],
};

module.exports = mongoose.model("User", userSchema);
