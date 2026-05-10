import { Router } from "express";
import validate from "../validators/team.validators";
import controller from "../controllers/team.controllers";

// *** Team API commands *** \\
const router = Router();

// Gets
router.get("/all", controller.getAllTeams);
router.get("/:id", validate.id, controller.getTeam);
router.get("/event/:id", validate.id, controller.getEventTeams);

// Sets
router.post("/", validate.createTeam, controller.createTeam);
router.delete("/:id", validate.id, controller.removeTeam);
router.patch("/:id", validate.updateTeam, controller.updateTeam);

export default router;
