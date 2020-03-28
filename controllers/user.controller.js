require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const ApiError = require("../models/api-error.model");

module.exports.list = (req, res, next) => {
  User.find()
    .then(users => res.status(201).json(users))
    .catch(error => next(new ApiError(error.message)));
};

module.exports.create = (req, res, next) => {
  const { email } = req.body.email;
  User.findOne({ email })
    .then(user => {
      if (user) {
        res.json({
          message: "User already exists"
        });
      } else {
        const newUser = new User(req.body);
        return newUser
          .save()
          .then(userCreated => {
            res.status(201).json(userCreated);
          })
          .catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
              console.log(error);
              next(new ApiError(error.errors));
            } else {
              next(new ApiError(error.message, 500));
            }
          });
      }
    })
    .catch(error => next(new ApiError(error.message, 500)));
};

module.exports.get = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .populate("likes")
    .populate("plans")
    .then(user => {
      if (user) {
        res.status(201).json(user);
      } else {
        next(new ApiError("User not found", 404));
      }
    })
    .catch(error => next(error));
};

module.exports.edit = (req, res, next) => {
  const { id } = req.params;
  User.findByIdAndUpdate(
    id,
    {
      $set: req.body
    },
    {
      new: true
    }
  )
    .then(user => {
      if (user) {
        res.status(201).json(user);
      } else {
        next(new ApiError("User not found", 404));
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

module.exports.changePassword = (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;
  User.findById(id, (error, user) => {
    if (user) {
      user
        .save({
          id,
          password
        })
        .then(userPasswordUpdated => {
          res.status(201).json(userPasswordUpdated);
        })
        .catch(error => {
          if (error instanceof mongoose.Error.ValidationError) {
            console.log(error);
            next(new ApiError(error.errors));
          } else {
            next(new ApiError(error.message, 500));
          }
        });
    }
  }).catch(error => next(error));
};

module.exports.delete = (req, res, next) => {
  const { id } = req.params;
  User.findByIdAndRemove(id)
    .then(user => {
      if (user) {
        res.status(204).json();
      } else {
        next(new ApiError("User not found", 404));
      }
    })
    .catch(error => new ApiError(error.message, 500));
};
