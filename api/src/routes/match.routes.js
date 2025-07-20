// Init
const router = require("express").Router();
const validate = require("../validators/match.validators");
const controller = require("../controllers/match.controllers");
const action = require("../controllers/action.controllers");

// *** Match API commands *** \\

// Gets
router.get("/all", controller.getAllMatches);
router.get("/event/:eventid", validate.eventid, controller.getEventMatches);

// Sets
router.post("/swap", validate.swapPlayers, action.swapPlayers);
router.patch("/:id/drop", validate.updateDrops, controller.updateDrops);
router.post("/:id", validate.reportMatch, controller.reportMatch);
router.delete("/:id", validate.matchId, controller.unreportMatch);
router.patch("/:id", validate.updateMatch, controller.updateMatch);

module.exports = router;
