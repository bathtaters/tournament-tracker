// Imports
const checkValidation = require("../middleware/validate.middleware");
const { bySet, usingKey } = require("./shared.validators");
const { body, oneOf, param } = require("express-validator");

// Settings
const reportKeys = ["wins", "draws", "drops"];

// Settings for UpdateMatch Special Validation
const updateKeyRegEx = /^wins\.\d{1,3}$/;
const updateDropRegEx = /^drops\.\d{1,3}$/;
const updateKeys = ["draws"];

// Standard validation
module.exports = {
  eventid: bySet("match")("eventid"),
  matchId: bySet("match")("id"),
  reportMatch: bySet("match")("id", reportKeys),
  updateMatch: validateMatchUpdate,
  updateDrops: bySet("match")("id", ["playerid", "undrop"]),
  swapPlayers: bySet("swap")(0, "all"),
};

// *** UpdateMatch: SPECIAL VALIDATION *** \\
async function validateMatchUpdate(req, res, next) {
  try {
    // Check ID param
    await param("id").isUUID().run(req);

    // Check key
    await oneOf([
      body("key").matches(updateKeyRegEx),
      body("key").matches(updateDropRegEx),
      body("key").isIn(updateKeys),
    ]).run(req);

    // Check value
    if (updateKeyRegEx.test(req.body.key)) {
      await usingKey("value", "match", "draws").run(req); // wins
    } else if (updateDropRegEx.test(req.body.key)) {
      await usingKey("value", "player", "id").run(req); // drops
    } else {
      await usingKey("value", "match", req.body.key).run(req); // other
    }
  } catch (err) {
    next(err);
  }

  checkValidation(req, res, next);
}
