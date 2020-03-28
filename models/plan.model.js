const mongoose = require("mongoose");
const CATEGORIES_TYPES = require("./categories-types.js");

const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "The title is required"]
    },
    host: {
      type: String
    },
    link: {
      type: String,
      required: [true, "The link is required"]
    },
    imageUrl: {
      type: String,
      required: [true, "The url for the image is required"]
    },
    language: {
      type: String,
      required: [true, "The language of the plan is required"]
    },
    category: {
      type: String,
      enum: CATEGORIES_TYPES,
      required: [true, "The category is required"]
    },
    date: {
      type: Date,
      required: [true, "The date is required"]
    },
    description: {
      type: String
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

planSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "plan"
});

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;
