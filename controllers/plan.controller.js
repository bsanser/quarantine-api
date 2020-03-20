const mongoose = require("mongoose");
const Plan = require("../models/plan.model");
const ApiError = require("../models/api-error.model");

module.exports.list = (req, res, next) => {
  Plan.find()
    .then(plans => res.json(plans))
    .catch(error => next(error));
};

module.exports.get = (req, res, next) => {
  const { id } = req.params;
  Plan.findById(id)
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
    host,
    link,
    categories,
    audience,
    date,
    description
  } = req.body;

  const plan = new Plan({
    title,
    host,
    link,
    categories,
    audience,
    date,
    description
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

module.exports.getByCategory = (req, res, next) => {
  const { category } = req.query;
  Plan.find({
    categories: category
  })
    .then(plan => {
      if (plan) {
        res.status(201).json(plan);
      } else {
        next(new ApiError("Plan by category not found", 404));
      }
    })
    .catch(error => {
      next(error);
    });
};

module.exports.edit = (req, res, next) => {
  const id = req.params.id;
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
