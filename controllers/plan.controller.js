const mongoose = require("mongoose");
const Plan = require("../models/plan.model");
const Like = require("../models/like.model");
const User = require("../models/user.model");
const ApiError = require("../models/api-error.model");
const mql = require("@microlink/mql");

const fetchFilters = ({ category, language, from, to }) => {
  let filter = {};

  if (category) {
    filter = {
      ...filter,
      category,
    };
  }

  if (language) {
    filter = {
      ...filter,
      language,
    };
  }

  if (from || to) {
    let date = {};

    if (from) {
      date = {
        ...date,
        $gte: from,
      };
    }

    if (to) {
      date = {
        ...date,
        $lt: to,
      };
    }

    filter = {
      ...filter,
      date,
    };
  }
  return filter;
};

//Refactor listAllPlans and ListUpcoming

module.exports.listAllPlans = (req, res, next) => {
  const { category, language, from } = req.query;
  const initialDate = new Date(from);
  const year = initialDate.getFullYear();
  const month = initialDate.getMonth() + 1;
  const day = initialDate.getDate();
  const nextDay = day + 1;
  const selectedDayStart = new Date(`${year}-${month}-${day}`);
  const selectedDayEnd = new Date(`${year}-${month}-${nextDay}`);
  if (!from) {
    const filters = fetchFilters({
      category: category,
      language: language,
    });

    return Plan.find(filters)
      .sort({ date: "asc" })
      .then((plans) => res.json(plans))
      .catch((error) => next(error));
  }

  const filters = fetchFilters({
    category: category,
    language: language,
    from: selectedDayStart || new Date(),
    to: selectedDayEnd,
  });

  Plan.find(filters)
    .sort({ date: "asc" })
    .then((plans) => res.json(plans))
    .catch((error) => next(error));
};

module.exports.listUpcoming = (req, res, next) => {
  const { category, language, from } = req.query;
  const initialDate = new Date(from);
  const year = initialDate.getFullYear();
  const month = initialDate.getMonth() + 1;
  const day = initialDate.getDate();
  const nextDay = day + 1;
  const selectedDayStart = new Date(`${year}-${month}-${day}`);
  const selectedDayEnd = new Date(`${year}-${month}-${nextDay}`);
  if (!from) {
    const filters = fetchFilters({
      category: category,
      language: language,
      from: new Date(),
    });

    return Plan.find(filters)
      .sort({ date: "asc" })
      .then((plans) => res.json(plans))
      .catch((error) => next(error));
  }

  const filters = fetchFilters({
    category: category,
    language: language,
    from: selectedDayStart || new Date(),
    to: selectedDayEnd,
  });

  console.log(JSON.stringify(filters));

  Plan.find(filters)
    .sort({ date: "asc" })
    .then((plans) => res.json(plans))
    .catch((error) => next(error));
};

module.exports.listCreatedPlans = (req, res, next) => {
  const currentUser = req.user;
  User.findById(currentUser.id)
    .populate("plans")
    .then((user) => res.json(user.plans));
};

module.exports.listLikedPlans = (req, res, next) => {
  const currentUser = req.user;
  const likedPlans = [];

  User.findById(currentUser.id)
    .populate("likes")
    .then(async (user) => {
      const likedPlansIds = user.likes.map((like) => like.plan);

      for (let i = 0; i < likedPlansIds.length; i++) {
        const plan = await Plan.findById(likedPlansIds[i]);
        likedPlans.push(plan);
      }
      res.json(likedPlans);
    })
    .catch(err => next(err));
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
    .then((plan) => {
      if (plan) {
        res.json(plan);
      } else {
        next(new ApiError(`Sorry, we were not able to find that plan`, 404));
      }
    })
    .catch((error) => next(error));
};

module.exports.create = (req, res, next) => {
  const {
    title,
    link,
    category,
    date,
    description,
    imageUrl,
    language,
  } = req.body;

  const plan = new Plan({
    title,
    link,
    category,
    date,
    description,
    imageUrl,
    language,
    user: req.user,
  });

  plan
    .save()
    .then(() => {
      res.status(201).json(plan);
    })
    .catch((error) => {
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
    .then((like) => {
      if (like) {
        Like.findByIdAndRemove(like._id)
          .then(() => res.json({ likes: -1, isLiked: false }))
          .catch((error) => next(error));
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
    .then((plan) => res.status(200).json(plan.likes.length))
    .catch((err) => console.log(err));
};

module.exports.isLiked = (req, res, next) => {
  const planId = req.params.id;
  User.findById(req.user._id)
    .populate("likes")
    .then((user) => {
      const filteredArray = user.likes.filter((like) => like["plan"] == planId);
      res.json(filteredArray.length !== 0);
    });
};

module.exports.edit = (req, res, next) => {
  const { id } = req.params;
  Plan.findByIdAndUpdate(
    id,
    {
      $set: req.body,
    },
    {
      new: true,
    }
  )
    .then((plan) => {
      if (plan) {
        res.status(201).json(plan);
      } else {
        next(new ApiError("The plan to update was not found", 404));
      }
    })
    .catch((error) => {
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
    .then((plan) => {
      if (plan) {
        res.status(204).json("Plan deleted successfully");
      } else {
        next(new ApiError("Plan not found", 404));
      }
    })
    .catch((error) => new ApiError(error.message, 500));
};
