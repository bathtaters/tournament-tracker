import type { RequestHandler } from "express";
import checkValidation from "../middleware/validate.middleware";
import { bySet, usingKey } from "./shared.validators";
import { body, param } from "express-validator";

// Settings
const reportKeys = ["wins", "draws", "drops"];

// Settings for UpdateMatch Special Validation
const updateKeyRegEx = /^wins\.\d{1,3}$/;
const updateDropRegEx = /^drops\.\d{1,3}$/;
const updateKeys = ["draws"];

// *** UpdateMatch: SPECIAL VALIDATION *** \\
const validateMatchUpdate: RequestHandler = async (req, res, next) => {
  try {
    // Basic validation
    await param("id").isUUID().run(req);
    await body("key").isString().run(req);

    // Check 'value' based on 'key'
    if (updateKeyRegEx.test(req.body.key)) {
      await usingKey("value", "match", "draws").run(req); // wins
    } else if (updateDropRegEx.test(req.body.key)) {
      await usingKey("value", "player", "id").run(req); // drops
    } else {
      await body("key").isIn(updateKeys).run(req);
      await usingKey("value", "match", req.body.key).run(req); // other
    }
  } catch (err) {
    next(err);
  }

  checkValidation(req, res, next);
};

// Standard validation
export default {
  eventid: bySet("match")("eventid") as RequestHandler[],
  matchId: bySet("match")("id") as RequestHandler[],
  reportMatch: bySet("match")("id", reportKeys) as RequestHandler[],
  updateDrops: bySet("match")("id", ["playerid", "undrop"]) as RequestHandler[],
  swapPlayers: bySet("swap")(null, "all") as RequestHandler[],
  updateMatch: validateMatchUpdate,
};
