import { Router } from "express";
import validate from "../validators/match.validators";
import * as controller from "../controllers/match.controllers";
import { swapPlayers } from "../controllers/action.controllers";

const router = Router();

// *** Match API commands *** \\

// Gets
router.get("/all", controller.getAllMatches);
router.get("/event/:eventid", validate.eventid, controller.getEventMatches);

// Sets
router.post("/swap", validate.swapPlayers, swapPlayers);
router.patch("/:id/drop", validate.updateDrops, controller.updateDrops);
router.post("/:id", validate.reportMatch, controller.reportMatch);
router.delete("/:id", validate.matchId, controller.clearMatch);
router.patch("/:id", validate.updateMatch, controller.updateMatch);

export default router;
