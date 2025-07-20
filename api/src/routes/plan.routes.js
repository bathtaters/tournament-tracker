// Init
const router = require("express").Router();
const controller = require("../controllers/plan.controllers");

// *** Plan API commands *** \\

router.get("/status", controller.getStatus);
router.post("/generate", controller.genPlan);
router.post("/save", controller.savePlan);
router.delete("/", controller.resetPlan);

module.exports = router;
