const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,

    required: [true, "You have to provide your first Name"],
  },
  lastName: {
    type: String,
    required: [true, "You have to provide your Last Name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "You have to provide your email"],
  },

  country: {
    type: String,
    default: "Poland",
  },

  birthDate: {
    type: String,
    required: [true, "Youhave to provide your birthdate"],
  },
  workPlace: {
    type: String,
  },
  highSchool: {
    type: String,
  },
  university: {
    type: String,
  },
  cityHome: {
    type: String,
  },
  relationshipStatus: {
    type: String,
  },

  profileImage: {
    type: String,
    default: "/imgs/faces/face1.jpg",
  },
  bannerImage: {
    type: String,
    default: "/imgs/faces/face1.jpg",
  },

  images: [{ type: String, field: { $size: 3 } }],

  posts: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
      },
      place: {
        type: String,
        enum: ["userPage", "groupPage"],
      },
    },
  ],

  gender: { type: String, enum: ["male", "female"], default: "male" },

  friends: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  blockList: [
    {
      schema: { type: mongoose.Schema.ObjectId, ref: "User" },
      since: { type: Date, default: Date.now() },
      till_date: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7),
      },
    },
  ],

  receivedRequests: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  sentRequests: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  peopleYouMayKnow__alreadySeen: [
    { type: mongoose.Schema.ObjectId, ref: "User" },
  ],
  password: {
    type: String,
    required: [true, "You have to provide your password"],
    select: false,
  },

  privacySettings: {
    visibilityOfPhotosTab: {
      type: String,
      enum: [
        "friends-only",
        "friends-and-their-friends-only",
        "public",
        "private",
      ],
      default: "public",
    },

    visibilityOfMoviesTab: {
      type: String,
      enum: [
        "friends-only",
        "friends-and-their-friends-only",
        "public",
        "private",
      ],
      default: "public",
    },

    visibilityOfInformationsTab: {
      type: String,
      enum: [
        "friends-only",
        "friends-and-their-friends-only",
        "public",
        "private",
      ],
      default: "public",
    },

    visibilityOfPhotosTab: {
      type: String,
      enum: [
        "friends-only",
        "friends-and-their-friends-only",
        "public",
        "private",
      ],
      default: "public",
    },
    visibilityOfFriends: {
      type: String,
      enum: [
        "friends-only",
        "friends-and-their-friends-only",
        "public",
        "private",
      ],
      default: "public",
    },

    visibilityOfFeed: {
      type: String,
      enum: [
        "friends-only",
        "friends-and-their-friends-only",
        "public",
        "private",
      ],
      default: "public",
    },
  },
  groups: {
    requests: {
      received: [
        {
          date: { type: Date, default: Date.now() },
          group: {
            type: mongoose.Schema.ObjectId,
            ref: "Groups",
            required: true,
          },
        },
      ],
      sent: [
        {
          date: { type: Date, default: Date.now() },
          group: {
            type: mongoose.Schema.ObjectId,
            ref: "Groups",
            required: true,
          },
        },
      ],
    },

    currentlyIn: [
      {
        date: { type: Date, default: Date.now() },
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: "Groups",
          required: [true, "You have to provide group id"],
        },
        role: {
          type: String,
          enum: ["administrator", "moderator", "user"],
          default: "user",
        },
      },
    ],
  },

  notifications: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Notifications",
    },
  ],

  activityStatus: {
    lastTimeOnline: { type: Date, defualt: Date.now(), required: true },
    status: {
      type: "string",
      enum: ["online", "offline"],
      defualt: "online",
      required: true,
    },
  },
  chats: [{ type: mongoose.Schema.ObjectId, ref: "Chats" }],
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// userSchema.pre("find", function () {
//   this.populate("posts");
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
