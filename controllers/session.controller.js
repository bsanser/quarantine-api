require("dotenv").config();
const passport = require("passport");
const ApiError = require("../models/api-error.model");

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new ApiError("Email and passoword are required"));
  } else {
    passport.authenticate("local-auth", (error, user, message) => {
      if (error) {
        next(error);
      } else if (!user) {
        next(new ApiError(message, 401));
      } else {
        req.login(user, error => {
          if (error) {
            next(new ApiError(error.message, 500));
          } else {
            res.status(201).json(req.user);
          }
        });
      }
    })(req, res, next);
  }
};

module.exports.logout = (req, res, next) => {
  req.session.destroy();
  req.user = null;
  res.status(204).json();
};

module.exports.loginWithGoogle = (req, res, next) => {
  passport.authenticate("google", (error, user) => {
    if (error) {
      next(error);
    } else if (!user) {
      next(new ApiError(message, 401));
    } else {
      req.login(user, error => {
        if (error) {
          next(new ApiError(error.message, 500));
        } else {
          res.status(201).json(req.user);
        }
      });
    }
  })(req, res, next);
};
