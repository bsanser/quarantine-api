const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const keys = require("./../configs/keys");
const SALT_WORK_FACTOR = 10;
const FIRST_ADMIN_EMAIL = keys.firstAdminEmail || process.env.FIRST_ADMIN_EMAIL;
const roles = require("./roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Name is required"
    },
    email: {
      type: String,
      required: "Email is required",
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address"
      ],
      unique: true
    },
    password: {
      type: String,
      required: "Password is required",
      min: [6, "Too few characters"],
      max: 12
    },
    image: {
      type: String,
      default:
        "https://www.linkteachers.com/frontend/foundation/images/dummy_user/default_image.jpg"
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    social: {
      googleId: String
    },
    role: {
      type: String,
      enum: [roles.ROLE_ADMIN, roles.ROLE_GUEST],
      default: roles.ROLE_GUEST
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.pre("save", function(next) {
  if (this.email === FIRST_ADMIN_EMAIL) {
    this.role = roles.ROLE_ADMIN;
  }

  if (this.isModified("password")) {
    bcrypt
      .genSalt(SALT_WORK_FACTOR)
      .then(salt => {
        return bcrypt.hash(this.password, salt);
      })
      .then(hash => {
        this.password = hash;
        next();
      })
      .catch(error => next(error));
  } else {
    next();
  }
});

userSchema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual("plans", {
  ref: "Plan",
  localField: "_id",
  foreignField: "user",
  justOne: false
});
userSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "user",
  justOne: false
});

const User = mongoose.model("User", userSchema);
module.exports = User;
