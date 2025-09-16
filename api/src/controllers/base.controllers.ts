import type { Request, Response } from "express";
import type { Event, EventDay, Match, Player } from "types/models";
import type { Settings } from "types/base";
import { matchedData } from "express-validator";

// Models
import * as event from "../db/models/event";
import * as match from "../db/models/match";
import * as player from "../db/models/player";
import * as setting from "../db/models/settings";

// Imports
import { resetDatabase } from "../services/db.services";
import {
  asType,
  fromObjArray,
  toObjArray,
} from "../services/settings.services";
import { cancelPlan } from "../services/plan.services";
import { arrToObj } from "../utils/shared.utils";
import logger from "../utils/log.adapter";

/* GET page data. */

// All data
export async function getAll(_: Request, res: Response) {
  const settings = (await setting.getAll().then(fromObjArray)) as Settings;
  const schedule: Record<EventDay["day"], EventDay> = await event
    .getSchedule()
    .then(arrToObj("day"));
  const events: Record<Event["id"], Event & { matches?: Match["id"][][] }> =
    await event.get().then(arrToObj("id"));
  const players: Record<Player["id"], Player> = await player
    .get()
    .then(arrToObj("id"));

  const matches = await match.listByEvent();
  matches.forEach(({ eventid, round, matches }) => {
    if (!events[eventid])
      return logger.error("Match is missing event", eventid);
    if (!("matches" in events[eventid])) events[eventid].matches = [];
    events[eventid].matches[round - 1] = matches;
  });

  return res.sendAndLog({ settings, schedule, events, players });
}

// Settings
export async function getSetting(req: Request, res: Response) {
  const { id } = matchedData<{ id: keyof Settings & string }>(req);
  const raw = await setting.get([id]).then((r) => r?.[0]);
  if (!raw) throw new Error(`'${id}' setting not found.`);
  return res.sendAndLog({ decoded: asType(raw), ...raw });
}

export async function getSettings(_: Request, res: Response) {
  const settings = await setting.getAll();
  if (!Array.isArray(settings)) throw new Error("Settings not found.");
  return res.sendAndLog(fromObjArray(settings));
}

export async function setSettings(req: Request, res: Response) {
  const settings = matchedData(req);
  if (!Object.keys(settings).length) return res.sendAndLog({ success: false });

  const settingsArray = toObjArray(settings);

  const set = await setting
    .batchSet(settingsArray, req)
    .then((r) => r && r.map((s) => s.id));

  if (set.includes("planstatus") && settings["planstatus"] === 2) {
    if (await cancelPlan())
      return res.sendAndLog({ success: true, set, cancelled: true });
  }
  return res.sendAndLog({ success: true, set });
}

// Schedule data
export const getSchedule = (planOnly = false) =>
  async function (_: Request, res: Response) {
    const [schedule, settingsData] = await Promise.all([
      event.getSchedule(planOnly).then(arrToObj("day")) as Promise<
        Record<EventDay["day"], EventDay>
      >,
      setting.get([
        "dayslots",
        "datestart",
        "dateend",
        "planslots",
        "plandates",
        "planschedule",
      ]),
    ]);

    const settings = fromObjArray(settingsData) as Pick<
      Settings,
      | "dayslots"
      | "datestart"
      | "dateend"
      | "planslots"
      | "plandates"
      | "planschedule"
    >;
    return res.sendAndLog({ schedule, settings });
  };

// RESET DB
export const resetDB =
  (full = false) =>
  (_: Request, res: Response) =>
    resetDatabase(full, true).then((r) =>
      res.sendAndLog({ reset: Boolean(r & 1), full: Boolean(r & 2) }),
    );
