/* *** EVENT CLOCK Sub-Object *** */
import type { Request } from "express";
import type { Event } from "../../types/models";
import db from "../admin/interface";
import log from "./log";
import { clock as sqlStrings } from "../sql/strings";
import { enums } from "../../config/validation";

const { TableName, LogAction } = enums;

// Event Clock Operations //

export const get = (
  eventid: Event,
): Promise<Pick<Event, "id" | "clocklimit" | "clockstart" | "clockmod">> =>
  db.getRow("event", eventid, ["id", "clocklimit", "clockstart", "clockmod"]);

export const run = (
  eventid: Event["id"],
  req: Request,
): Promise<Event[] | Event> =>
  log.query(
    sqlStrings.start,
    [eventid],
    (data: Event[], error) =>
      error || !data?.length
        ? {
            tableid: eventid,
            error: error || "Event not found or clock already running",
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: "now() - clockmod", clockmod: null },
          }
        : data.map((entry) => ({
            tableid: entry.id || eventid,
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: entry.clockstart, clockmod: entry.clockmod },
          })),
    req,
  );

export const pause = (
  eventid: Event["id"],
  req: Request,
): Promise<Event[] | Event> =>
  log.query(
    sqlStrings.pause,
    [eventid],
    (data, error) =>
      error || !data?.length
        ? {
            tableid: eventid,
            error: error || "Event not found or clock is not running",
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: null, clockmod: "now() - clockstart" },
          }
        : data.map((entry) => ({
            tableid: entry.id || eventid,
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            data: { clockstart: entry.clockstart, clockmod: entry.clockmod },
          })),
    req,
  );

export const reset = (
  eventid: Event["id"],
  req: Request,
): Promise<Event[] | Event> =>
  log.updateRows(
    "event",
    eventid,
    {
      clockstart: null,
      clockmod: null,
    },
    req,
  );
