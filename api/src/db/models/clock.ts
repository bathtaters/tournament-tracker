/* *** EVENT CLOCK Sub-Object *** */
import type { Request } from "express";
import type { Event } from "../../types/models";
import { getRow } from "../admin/interface";
import { query, updateRows } from "./log";
import { clock as sqlStrings } from "../sql/strings";
import { enums } from "../../config/validation";

const { TableName, LogAction } = enums;
type EventClock = Pick<Event, "id" | "clocklimit" | "clockstart" | "clockmod">;

// Event Clock Operations //

export const get = (eventid: Event) =>
  getRow<EventClock>("event", eventid, [
    "id",
    "clocklimit",
    "clockstart",
    "clockmod",
  ]);

export const run = (eventid: Event["id"], req: Request) =>
  query<Event>(
    sqlStrings.start,
    [eventid],
    (data, error) =>
      error || !data
        ? {
            tableid: eventid,
            error: error || "Event not found or clock already running",
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: "now() - clockmod", clockmod: null },
          }
        : {
            tableid: data.id || eventid,
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: data.clockstart, clockmod: data.clockmod },
          },
    req,
  ).then((r) => r[0]);

export const pause = (eventid: Event["id"], req: Request) =>
  query<Event>(
    sqlStrings.pause,
    [eventid],
    (data, error) =>
      error || !data
        ? {
            tableid: eventid,
            error: error || "Event not found or clock is not running",
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: null, clockmod: "now() - clockstart" },
          }
        : {
            tableid: data.id || eventid,
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: data.clockstart, clockmod: data.clockmod },
          },
    req,
  ).then((r) => r[0]);

export const reset = (eventid: Event["id"], req: Request) =>
  updateRows<Event>(
    "event",
    eventid,
    {
      clockstart: null,
      clockmod: null,
    },
    req,
  );
