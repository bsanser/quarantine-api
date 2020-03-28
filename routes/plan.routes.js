const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");

router.get("/", planController.list);
router.get("/url-info", planController.getInfoFromUrl);
router.get("/:id/total-likes", planController.getPlanTotalLikes);
router.get("/:id", planController.get);
router.post("/:id/like", planController.like);
router.post("/", planController.create);
router.put("/:id", planController.edit);
router.delete("/:id", planController.delete);

module.exports = router;
