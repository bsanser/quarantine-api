const mongoose = require("mongoose");
const Plan = require("../models/plan.model");
const Like = require("../models/like.model");
const User = require("../models/user.model");
const ApiError = require("../models/api-error.model");
const mql = require("@microlink/mql");

const hasAppliedFilter = filters => {
  return Object.values(filters).some(k => k !== "all");
};

module.exports.list = (req, res, next) => {
  const filters = req.query;
  if (!hasAppliedFilter(filters)) {
    Plan.find()
      .populate("user")
      .populate("likes")
      .then(plans => res.json(plans))
      .catch(error => next(error));
  } else {
    const query = Plan.find();
    const appliedFilters = Object.keys(filters)
      .filter(key => filters[key] !== "all")
      .map(key => ({
        filter: key,
        value: filters[key]
      }));
    for (var i = 0; i < appliedFilters.length; i++) {
      if (appliedFilters[i].filter === "date") {
        query.where(appliedFilters[i].filter).gt(appliedFilters[i].value);
      }
      query.where(appliedFilters[i].filter).equals(appliedFilters[i].value);
    }
    query
      .exec()
      .then(plans => res.json(plans))
      .catch(error => next(error));
  }
};

module.exports.getInfoFromUrl = async (req, res, next) => {
  const { url } = req.query;
  const { data } = await mql(url);
  res.status("201").json(data);
};

module.exports.get = (req, res, next) => {
  const { id } = req.params;
  Plan.findById(id)
    .populate("user")
    .populate("likes")
    .then(plan => {
      if (plan) {
        res.json(plan);
      } else {
        next(new ApiError(`Sorry, we were not able to find that plan`, 404));
      }
    })
    .catch(error => next(error));
};

module.exports.create = (req, res, next) => {
  const {
    title,
    link,
    category,
    date,
    description,
    imageUrl,
    language
  } = req.body;

  const plan = new Plan({
    title,
    link,
    category,
    date,
    description,
    imageUrl,
    language,
    user: req.user
  });

  plan
    .save()
    .then(() => {
      res.status(201).json(plan);
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ApiError(error.errors));
      } else {
        next(new ApiError(error.message, 500));
      }
    });
};

module.exports.like = (req, res, next) => {
  const planId = req.params.id;
  const currentUser = req.user; //._id
  Like.findOne({ plan: planId, user: currentUser._id })
    .then(like => {
      if (like) {
        Like.findByIdAndRemove(like._id)
          .then(() => res.json({ likes: -1, isLiked: false }))
          .catch(error => next(error));
      } else {
        const like = new Like({ plan: planId, user: currentUser._id });
        like
          .save()
          .then(() => res.json({ likes: 1, isLiked: true }))
          .catch(next);
      }
    })
    .catch(next);
};

module.exports.getPlanTotalLikes = (req, res, next) => {
  const planId = req.params.id;
  Plan.findById(planId)
    .populate("likes")
    .then(plan => res.status(200).json(plan.likes.length))
    .catch(err => console.log(err));
};

module.exports.isLiked = (req, res, next) => {
  const planId = req.params.id;
  console.log("plan id:", planId);
  User.findById(req.user._id)
    .populate("likes")
    .then(user => {
      const filteredArray = user.likes.filter(like => like["plan"] == planId);
      res.json(filteredArray.length !== 0);
    });
};

module.exports.edit = (req, res, next) => {
  const { id } = req.params;
  Plan.findByIdAndUpdate(
    id,
    {
      $set: req.body
    },
    {
      new: true
    }
  )
    .then(plan => {
      if (plan) {
        res.status(201).json(plan);
      } else {
        next(new ApiError("The plan to update was not found", 404));
      }
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ApiError(error.message));
      } else {
        new ApiError(error.message, 500);
      }
    });
};

module.exports.delete = (req, res, next) => {
  const id = req.params.id;
  Plan.findByIdAndRemove(id)
    .then(plan => {
      if (plan) {
        res.status(204).json("Plan deleted successfully");
      } else {
        next(new ApiError("Plan not found", 404));
      }
    })
    .catch(error => new ApiError(error.message, 500));
};
