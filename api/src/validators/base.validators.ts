import type { RequestHandler } from "express";
import { bySet } from "./shared.validators";

const settings = bySet("settings");

export default {
  getSetting: settings("id") as RequestHandler[],
  setSettings: settings(null, "all", true) as RequestHandler[],
};
