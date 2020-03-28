require("dotenv").config();
const passport = require("passport");
const ApiError = require("../models/api-error.model");

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
          res.redirect("//localhost:3000/home");
        }
      });
    }
  })(req, res, next);
};

module.exports.getCurrentUser = (req, res, next) => {
  res.json(req.user ? req.user : {});
};

module.exports.logout = (req, res, next) => {
  req.session.destroy();
  req.user = null;
  res.status(204).json();
};
