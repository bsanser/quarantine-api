const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");

router.get("/", planController.list);
router.get("/:id", planController.get);
router.get("/category", planController.getByCategory);
router.post("/", planController.create);
router.put("/:id", planController.edit);
router.delete("/:id", planController.delete);

module.exports = router;
