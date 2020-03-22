const mongoose = require("mongoose");
const CATEGORIES_TYPES = require("./categories-types.js");
const AUDIENCE_TYPES = require("./audience-types");
const LANGUAGE_FLAGS = require("./language-flags");

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The title is required"]
    },
    host: {
      type: String,
      required: [true, "The host is required"]
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
    audience: {
      type: String,
      enum: AUDIENCE_TYPES,
      default: "all"
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
      transform: (doc, ret) => {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

planSchema.virtual("languageFlagUrl").get(function() {
  return LANGUAGE_FLAGS[this.language];
});

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;
