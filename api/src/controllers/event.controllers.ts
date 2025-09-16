import type { Request, Response } from "express";
import type { Event } from "types/models";
import type { ClockState } from "types/base";
import { matchedData } from "express-validator";
import { arrToObj } from "../utils/shared.utils";
import { defaults } from "../config/validation";

import * as event from "../db/models/event";
import * as clock from "../db/models/clock";
import * as match from "../db/models/match";

/* GET event database. */

// Specific event
export async function getEvent(req: Request, res: Response) {
  const { id } = matchedData(req);
  const eventData = await event.get(id, true);
  if (!eventData) return res.sendStatus(204);

  const matches = await match.listByEvent(id).then(sortMatchResult);

  return res.sendAndLog({ ...eventData, matches });
}

// Get clock data only
export async function getClock(req: Request, res: Response) {
  const { id } = matchedData(req);
  if (!id) throw new Error("Missing event ID.");

  let data = await clock
    .get(id)
    .then((data) => (Array.isArray(data) ? data[0] : data));
  if (!data) throw new Error("Event not found");
  return res.sendAndLog(data);
}

// All events
export const getAllEvents = (_: any, res: Response) =>
  event
    .get()
    .then(arrToObj("id", { delKey: false }))
    .then(res.sendAndLog);

/* SET event database. */

// Create/Remove event
export async function createEvent(req: Request, res: Response) {
  const slot = await event.getLastSlot(null).then((s) => s + 1);

  let body: Partial<Event> = matchedData(req);
  if (body.players) body.playercount = body.players.length;

  const eventData = { ...defaults.event, ...body, slot } as Event;
  return event.add(eventData, req).then(res.sendAndLog);
}
export async function removeEvent(req: Request, res: Response) {
  return event.rmv(matchedData(req).id, req).then(res.sendAndLog);
}

// Manually set event data (Guess day-slot if missing when updating day)
export async function updateEvent(req: Request, res: Response) {
  let { id, ...body } = matchedData<Partial<Event> & Pick<Event, "id">>(req);
  if (!("day" in body) && req.body.day === null) body.day = null; // Fix validation

  if (body.players) body.playercount = body.players.length;
  if ("day" in body && !("slot" in body))
    body.slot = await event.getLastSlot(body.day, id).then((s) => s + 1);

  return event.set(id, body, req).then(res.sendAndLog);
}

// Enable 'plan' for all eventIds, disable 'plan' for all missing eventIds
export function setPlan(req: Request, res: Response) {
  const { events } = matchedData(req);
  return event.setPlan(events, req).then(res.sendAndLog);
}

// Clock operations -- run/pause/reset
export const clockOp = (action: ClockState) => {
  switch (action) {
    case "run":
      return (req: Request, res: Response) => {
        const { id } = matchedData(req);
        if (!id) throw new Error("Missing event ID.");
        return clock
          .run(id, req)
          .then(res.sendAndLog)
          .catch(catchClockError("run"));
      };
    case "reset":
      return (req: Request, res: Response) => {
        const { id } = matchedData(req);
        if (!id) throw new Error("Missing event ID.");
        return clock.reset(id, req).then(res.sendAndLog);
      };
    case "pause":
      return (req: Request, res: Response) => {
        const { id } = matchedData(req);
        if (!id) throw new Error("Missing event ID.");
        return clock
          .pause(id, req)
          .then(res.sendAndLog)
          .catch(catchClockError("pause"));
      };
    default:
      throw new Error(`Unrecognized clock action: ${action}`);
  }
};

// GetEvent HELPER - index rounds
const sortMatchResult = (result: { round: number; matches: string[] }[]) =>
  result &&
  result.reduce((matchArr, row) => {
    matchArr[row.round - 1] = row.matches;
    return matchArr;
  }, [] as string[][]);

// Clock catcher
const catchClockError = (action: ClockState) => (err: any) => {
  if (err.message === "Event not found") {
    if (action === "run")
      throw new Error("Clock is already running or event not found");
    if (action === "pause")
      throw new Error("Clock is not running or event not found");
  }
  throw err;
};
