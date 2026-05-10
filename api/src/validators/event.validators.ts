import type { RequestHandler } from "express";
import validate from "./shared.validators";

const event = validate.bySet("event");
const plan = validate.bySet("plan");

export default {
  eventid: event("id") as RequestHandler[],
  rounds: event(["id", "roundactive"]) as RequestHandler[],
  createEvent: event([], "all", true) as RequestHandler[],
  updateEvent: event("id", "all", true) as RequestHandler[],
  setPlan: plan([], "events") as RequestHandler[],
};
