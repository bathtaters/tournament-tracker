/* *** EVENT Table Operations *** */
import type { Request } from "express";
import type {
  Event,
  EventDay,
  EventDetail,
  EventOpps,
  Match,
  Plan,
} from "types/models";
import db from "../admin/interface";
import log from "./log";
import { event as strings } from "../sql/strings";
import { enums } from "../../config/validation";

const { TableName, LogAction } = enums;

// Get event data
export async function get(
  id?: undefined,
  detail?: false,
  planOnly?: boolean,
): Promise<Event[]>;
export async function get(
  id: undefined,
  detail: true,
  planOnly?: boolean,
): Promise<EventDetail[]>;
export async function get(
  id: Event["id"],
  detail?: false,
  planOnly?: boolean,
): Promise<Event | undefined>;
export async function get(
  id: Event["id"],
  detail: true,
  planOnly?: boolean,
): Promise<EventDetail | undefined>;
export async function get(
  id?: Event["id"],
  detail = false,
  planOnly = false,
): Promise<Event[] | EventDetail[] | Event | EventDetail | undefined> {
  if (!id) return db.getRows("event", planOnly ? "WHERE plan > 0" : undefined);

  const eventData: EventDetail | EventDetail[] | undefined = await db.getRow(
    "event" + (detail ? "Detail" : ""),
    id,
  );
  if (!eventData || (Array.isArray(eventData) && eventData.length === 0))
    return;
  if (!Array.isArray(eventData) && eventData.drops.length)
    eventData.drops = eventData.drops.flat(1);
  return eventData;
}

export const getSchedule = (planOnly: boolean): EventDay[] =>
  db.query(
    `${strings.schedule.prefix}${
      planOnly ? strings.schedule.planOnly : strings.schedule.useSettings
    }${strings.schedule.suffix}`,
  );

export function getOpponents(
  eventid?: undefined,
  completed?: boolean,
): Promise<EventOpps[]>;
export function getOpponents(
  eventid: Event["id"],
  completed?: boolean,
): Promise<EventOpps | undefined>;
export function getOpponents(
  eventid?: Event["id"],
  completed = true,
): Promise<EventOpps | EventOpps[] | undefined> {
  return eventid
    ? db.getRow("eventOpps", eventid, null, { idCol: "eventid", getOne: false })
    : db.getRows("eventOpps", completed && strings.complete);
}

export const getPlayers = (
  id: Event["id"],
): Promise<Pick<Event, "id" | "players"> | undefined> =>
  db.getRow("event", id, "players");

export const getLastSlot = (
  day: Event["day"],
  id?: Event["id"],
): Promise<Event["slot"] | 0> => {
  const qry =
    strings.maxSlot[0] +
    (day ? "day = $1" : "day IS NULL") +
    (!id ? "" : day ? " AND id != $2" : " AND id != $1") +
    strings.maxSlot[1];
  return db
    .query(qry, [day, id].filter(Boolean))
    .then((r) => r?.[0]?.slot || 0);
};

export const getRound = (
  id: Event["id"],
): Promise<Event["roundactive"] | undefined> =>
  db.query(strings.maxRound, [id]).then((r) => r?.[0]?.round);

// Create a new event
export const add = (
  eventData: Omit<Event, "id">,
  req: Request,
): Promise<Event[]> => {
  eventData.players = eventData.players || [];
  return log.addRows("event", eventData, req);
};

export const pushRound = (
  eventid: Event["id"],
  round: Event["roundactive"],
  matchData: Omit<Match, "id"> | undefined,
  req: Request,
): Promise<[Event[], Match[] | undefined]> =>
  db.operation((client: any) =>
    Promise.all([
      // Increase active round counter
      log.updateRows("event", eventid, { roundactive: round }, req, { client }),
      // Create matches
      matchData && log.addRows("match", matchData, req, { client }),
    ]),
  );

export const popRound = (
  eventid: Event["id"],
  round: Event["roundactive"],
  req: Request,
): Promise<[Match[], Event[]]> =>
  db.operation((client: any) =>
    Promise.all([
      // Delete matches
      log.rmvRows("match", [eventid, round], strings.deleteRound, req, client),
      // Decrease active round counter
      log.updateRows("event", eventid, { roundactive: round - 1 }, req, {
        client,
      }),
    ]),
  );

export const setPlan = (ids: Plan["events"], req: Request) =>
  db.operation(
    (client: any): Promise<[Event[], Event[] | undefined]> =>
      Promise.all([
        // Clear unplanned events
        log.query(
          strings.unplan,
          [ids],
          (data, error) =>
            error
              ? {
                  dbtable: TableName.EVENT,
                  action: LogAction.UPDATE,
                  tableid: `NOT IN (${ids.join(",")})`,
                  data: { plan: 0 },
                  error,
                }
              : {
                  dbtable: TableName.EVENT,
                  action: LogAction.UPDATE,
                  tableid: data.id,
                  data,
                },
          req,
          false,
          client,
        ),
        // Set new plan order
        !ids.length
          ? Promise.resolve()
          : log.updateRows(
              "event",
              null,
              ids.map((id, idx) => ({ id, plan: idx + 1 })),
              req,
              { client, types: { plan: "SMALLINT" } },
            ),
      ]),
  );

export const rmv = (
  id: Event["id"],
  req: Request,
): Promise<Event | undefined> => log.rmvRows("event", id, null, req);

export const set = (
  id: Event["id"],
  newParams: Partial<Event>,
  req: Request,
): Promise<Event | undefined> => log.updateRows("event", id, newParams, req);
