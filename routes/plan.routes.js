const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");

router.get("/", planController.list);
router.get("/category", planController.getByCategory);
router.get("/url-info", planController.getInfoFromUrl);
router.get("/:id", planController.get);
router.post("/", planController.create);
router.put("/:id", planController.edit);
router.delete("/:id", planController.delete);

module.exports = router;
