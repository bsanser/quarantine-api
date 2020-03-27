const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session.controller");
const secureMiddleware = require("../middlewares/secure.middleware");
const passport = require("passport");

router.get("/current_user", sessionController.getCurrentUser);

router.get("/auth/google/callback", sessionController.loginWithGoogle);
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"]
  })
);

router.delete("/sessions", sessionController.logout);

module.exports = router;
