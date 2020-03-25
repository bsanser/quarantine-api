const mongoose = require("mongoose");
const Plan = require("../models/plan.model");
const ApiError = require("../models/api-error.model");
const mql = require("@microlink/mql");

const hasAppliedFilter = filters => {
  return Object.values(filters).some(k => k !== "all");
};

module.exports.list = (req, res, next) => {
  const filters = req.query;
  if (!hasAppliedFilter(filters)) {
    Plan.find()
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
    .then(plan => {
      if (plan) {
        res.json(plan);
      } else {
        next(new ApiError(`Sorry, we were not able to find that plan`, 404));
      }
    })
    .catch(error => next(error));
};

module.exports.getByCategory = (req, res, next) => {
  const { category } = req.query;

  Plan.find({
    category: category
  })
    .then(plan => {
      if (plan) {
        res.json(plan);
      } else {
        next(new ApiError("Plan by category not found", 404));
      }
    })
    .catch(error => {
      next(error);
    });
};

module.exports.getByLanguage = (req, res, next) => {
  const { language } = req.query;

  Plan.find({
    language: language
  })
    .then(plan => {
      if (plan) {
        res.json(plan);
      } else {
        next(new ApiError("Plan by language not found", 404));
      }
    })
    .catch(error => {
      next(error);
    });
};
module.exports.create = (req, res, next) => {
  const {
    title,
    host,
    link,
    category,
    audience,
    date,
    description,
    imageUrl,
    language
  } = req.body;

  const plan = new Plan({
    title,
    host,
    link,
    category,
    audience,
    date,
    description,
    imageUrl,
    language
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
