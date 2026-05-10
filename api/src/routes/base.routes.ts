// Init
import { Router } from "express";
import validate from "../validators/base.validators";
import {
  getAll,
  getSchedule,
  getSetting,
  getSettings,
  resetDB,
  setSettings,
} from "../controllers/base.controllers";
import { name, version } from "../config/meta";
import { testError } from "../config/constants";

const router = Router();

// *** Base API commands *** \\

// Test Api
router.get("/meta", (_, res) =>
  res.sendAndLog({ connected: true, name, version }),
);
router.get("/error", () => {
  throw testError;
});

// All data
router.get("/all", getAll);

// Settings
router.get("/settings", getSettings);
router.get("/settings/:id", validate.getSetting, getSetting);
router.patch("/settings", validate.setSettings, setSettings);

// Schedule
router.get("/schedule/plan", getSchedule(true));
router.get("/schedule", getSchedule());

// RESET TO DEMO DB (Dev only)
router.post("/reset/full", resetDB(true));
router.post("/reset", resetDB());

export default router;
