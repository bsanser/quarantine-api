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
      console.log("entro en la busqueda del like");
      if (like) {
        console.log("encuentro el like");
        Like.findByIdAndRemove(like._id)
          .then(like => {
            console.log("esto es el like", like);
            User.findById(currentUser._id)
              .populate("plans")
              .populate("likes")
              .then(user =>
                console.log(
                  "aqui el user stringified",
                  JSON.stringify(user, null, "\t")
                )
              );
          })
          .catch(error => next(error));
      } else {
        console.log("no encuentro el like");
        const like = new Like({ plan: planId, user: currentUser._id });
        like
          .save()
          .then(
            User.findByIdAndUpdate(currentUser._id)
              .populate("likes")
              .populate("plans")
              .then(user =>
                console.log("un like nuevo", JSON.stringify(user, null, "\t"))
              )
            // // res.json({ likes: 1 });
          )
          .catch(next);
      }
    })
    .catch(next);
};

module.exports.getPlanTotalLikes = (req, res, next) => {
  const planId = req.params.id;
  Plan.findById(planId)
    .then(plan => res.status(200).json(plan.likes.length))
    .catch(err => console.log(err));
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
