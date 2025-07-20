// Init
const router = require("express").Router();
const validate = require("../validators/voter.validators");
const controller = require("../controllers/voter.controllers");

// *** Voter API commands *** \\

// Gets
router.get("/all", controller.getAllVotes);
router.get("/:id", validate.playerid, controller.getVote);

// Sets
router.post("/", validate.setVoters, controller.setVoters);
router.patch("/:id", validate.updateVotes, controller.updateVote);

module.exports = router;
