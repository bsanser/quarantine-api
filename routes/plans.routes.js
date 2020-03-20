const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");

router.get("/", planController.list);
router.get("/:id", planController.get);
router.post("/", planController.create);

module.exports = router;
