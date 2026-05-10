/* *** EVENT Table Operations *** */
import type { Request } from "express";
import type { PoolClient } from "pg";
import type { Event, EventDay, EventDetail, Match, Plan } from "types/models";
import type { EventOpps } from "types/generators";
import { getRow, getRows, operation } from "../admin/interface";
import { addRows, query, rmvRows, updateRows } from "./log";
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
  id: Event["id"],
  detail?: false,
  planOnly?: boolean,
): Promise<Event | undefined>;
export async function get(
  id: Event["id"],
  detail: true,
  planOnly?: boolean,
): Promise<EventDetail | undefined>;
export async function get(id?: Event["id"], detail = false, planOnly = false) {
  if (!id)
    return getRows<Event>("event", planOnly ? "WHERE plan > 0" : undefined);

  const eventData = await getRow<Event | EventDetail>(
    detail ? "eventdetail" : "event",
    id,
  );
  if (!eventData) return;
  if ("drops" in eventData && eventData.drops?.length)
    eventData.drops = eventData.drops.flat(1);
  return eventData;
}

export const getSchedule = (planOnly = false) =>
  query<EventDay>(
    `${strings.schedule.prefix}${
      planOnly ? strings.schedule.planOnly : strings.schedule.useSettings
    }${strings.schedule.suffix}`,
  );

export function getOpponents(eventid?: Event["id"], completed = true) {
  return eventid
    ? getRow<EventOpps>("eventopps", eventid, "*", {
        idCol: "eventid",
        getOne: false,
      })
    : getRows<EventOpps>("eventopps", completed && strings.complete);
}

export const getPlayers = (
  id: Event["id"],
): Promise<Pick<Event, "id" | "players"> | undefined> =>
  getRow("event", id, ["players"]);

export const getLastSlot = (
  day: Event["day"],
  id?: Event["id"],
): Promise<Event["slot"] | 0> => {
  const qry =
    strings.maxSlot[0] +
    (day ? "day = $1" : "day IS NULL") +
    (!id ? "" : day ? " AND id != $2" : " AND id != $1") +
    strings.maxSlot[1];
  return query<Event>(qry, [day, id].filter(Boolean)).then(
    (r) => r[0]?.slot ?? 0,
  );
};

export const getRound = (
  id: Event["id"],
): Promise<Match["round"] | undefined> =>
  query<Match>(strings.maxRound, [id]).then((r) => r?.[0]?.round);

// Create a new event
export const add = (eventData: Omit<Event, "id">, req: Request) => {
  eventData.players = eventData.players || [];
  return addRows<Event>("event", [eventData], req).then((r) => r?.[0]);
};

export const rmvPlayer = (
  playerId: Event["players"][number],
  req?: Request,
  client?: PoolClient,
) =>
  query<Event>(
    strings.removePlayer,
    [playerId],
    (data, error) =>
      error
        ? {
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            tableid: `${playerId} = ANY(players)`,
            data: { players: [playerId] },
            error,
          }
        : {
            dbtable: TableName.EVENT,
            action: LogAction.UPDATE,
            tableid: data.id,
            data,
          },
    req,
    client,
  );

export const pushRound = (
  eventid: Event["id"],
  round: Event["roundactive"],
  matchData?: Partial<Match>[],
  req?: Request,
): Promise<[Event | undefined, Match[] | undefined]> =>
  operation((client) =>
    Promise.all([
      // Increase active round counter
      updateRows<Event>("event", eventid, { roundactive: round }, req, {
        client,
      }).then((r) => r[0]),
      // Create matches
      addRows<Match>("match", matchData ?? [], req, { client }),
    ]),
  );

export const popRound = (
  eventid: Event["id"],
  round: Event["roundactive"],
  req: Request,
): Promise<[Match[], Event[]]> =>
  operation((client) =>
    Promise.all([
      // Delete matches
      rmvRows<Match>(
        "match",
        [eventid, round],
        strings.deleteRound,
        req,
        client,
      ),
      // Decrease active round counter
      updateRows<Event>("event", eventid, { roundactive: round - 1 }, req, {
        client,
      }),
    ]),
  );

export const setPlan = (ids: Plan["events"], req: Request) =>
  operation(
    (client: any): Promise<[Event[], Event[] | undefined]> =>
      Promise.all([
        // Clear unplanned events
        query<Event>(
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
          client,
        ),
        // Set new plan order
        !ids.length
          ? Promise.resolve(undefined)
          : updateRows<Event>(
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
): Promise<Event | undefined> =>
  rmvRows<Event>("event", id, undefined, req).then((r) => r[0]);

export const set = (
  id: Event["id"],
  newParams: Partial<Event>,
  req: Request,
): Promise<Event | undefined> =>
  updateRows<Event>("event", id, newParams, req).then((r) => r[0]);
