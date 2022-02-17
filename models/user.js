const mongoose = require("mongoose");

const userSchema = {
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
   
  },
  password: {
    type: String,
   
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
  otherDetails: [
    {
      Profilecreatedby: {
        type: String,
      },
      Diet: {
        type: String,
      },
    },
  ],
  EducationAndCareer: [
    {
      HighestQualification: {
        type: String,
      },
      WorkingAs: {
        type: String,
      },
      AnnualIncome: {
        type: String,
      },
      Workingwith: {
        type: String,
      },
      ProfessionalArea: {
        type: String,
      },
    },
  ],
  LocationDetails: [
    {
      Countrylivingin: {
        type: String,
      },
      Statelivingin: {
        type: String,
      },
      CityDistrict: {
        type: String,
      },
    },
  ],
  BasicInfo: [
    {
      Age: {
        type: String,
      },
      Height: {
        type: String,
      },
      Religion: {
        type: String,
      },
      Mothertongue: {
        type: String,
      },
      MaritalStatus: {
        type: String,
      },
    },
  ],
  HobbiesInterestsMore: [
    {
      Hobbies: {
        type: String,
      },
      Interests: {
        type: String,
      },
      FavouriteMusic: {
        type: String,
      },
      FavouriteReads: {
        type: String,
      },
      preferredMovies: {
        type: String,
      },
      SportsFitnessActivities: {
        type: String,
      },
      FavouriteCusisine: {
        type: String,
      },
      PreferredDressStyle: {
        type: String,
      },
    },
  ],
  LocationofGroom: [
    {
      CurrentResidence: {
        type: String,
      },
      StateofResidence: {
        type: String,
      },
      ResidencyStatus: {
        type: String,
      },
      ZipPincode: {
        type: String,
      },
    },
  ],
  EducationAndCareer: [
    {
      HighestQualification: {
        type: String,
      },
      CollegeAttended: {
        type: String,
      },
      AnnualIncome: {
        type: String,
      },
      WorkingWith: {
        type: String,
      },
      WorkingAs: {
        type: String,
      },
      EmployerName: {
        type: String,
      },
    },
  ],
  Familydetails: [
    {
      FatherStatus: {
        type: String,
      },
      MotherStatus: {
        type: String,
      },
      FamilyLocation: {
        type: String,
      },
      NativePlace: {
        type: String,
      },
      NoofBrothers: {
        type: String,
      },
      NoofSisters: {
        type: String,
      },
      FamilyType: {
        type: String,
      },
      FamilyValues: {
        type: String,
      },
      FamilyAffluence: {
        type: String,
      },
    },
  ],
  ReligiousBackground: [
    {
      Religion: {
        type: String,
      },
      Community: {
        type: String,
      },
      SubCommunity: {
        type: String,
      },
      MotherTongue: {
        type: String,
      },
      CanSpeak: {
        type: String,
      },
    },
  ],
  BasicsAndLifestyle: [
    {
      Age: {
        type: String,
      },
      DateofBirth: {
        type: String,
      },
      MaritalStatus: {
        type: String,
      },
      Height: {
        type: String,
      },
      Grewupin: {
        type: String,
      },
      Diet: {
        type: String,
      },
      PersonalValues: {
        type: String,
      },
      SunSign: {
        type: String,
      },
      BloodGroup: {
        type: String,
      },
      Heal: {
        type: String,
      },
    },
  ],
};

module.exports = mongoose.model("User", userSchema);
