const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session.controller");
const secureMiddleware = require("../middlewares/secure.middleware");
const passport = require("passport");

router.get("/api/current_user", function(req, res) {
  res.send(req.session);
});

router.get("/auth/google/callback", sessionController.loginWithGoogle);
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"]
  })
);
router.post("/sessions", sessionController.login);
router.delete("/sessions", sessionController.logout);

module.exports = router;
