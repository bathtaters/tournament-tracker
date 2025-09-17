import type { Event, Team } from "types/models";
import type { Request } from "express";
import { getCount, getRow, getRows, operation } from "../admin/interface";
import { addRows, rmvRows, updateRows } from "./log";
import { team } from "../sql/strings";

// GETS \\

export const get = (id: Team["id"]): Promise<Team> => getRow<Team>("team", id);

export const list = (eventid?: Event["id"]): Promise<Team[]> =>
  eventid
    ? getRows<Team>("team", team.eventFilter, [eventid])
    : getRows<Team>("team");

// SETS \\

export const add = (
  players: Team["players"],
  name: Team["name"],
  req: Request,
): Promise<Team | undefined> =>
  operation(async (client) => {
    // Test that player IDs are legitness
    const playerCount: number | undefined = await getCount(
      "player",
      "WHERE id = ANY($1)",
      [players],
      client,
    );
    if (players?.length !== playerCount)
      throw new Error(
        `Team members must be players. Only found ${playerCount} of ${players.length}.`,
      );

    // Create team
    return addRows<Team>("team", [{ players, name }], req, { client });
  }).then((r) => (Array.isArray(r) ? r[0] : r));

export const rmv = (id: Team["id"], req: Request): Promise<Team | undefined> =>
  rmvRows<Team>("team", [id], null, req).then((r) => r?.[0]);

export const set = (
  id: Team["id"],
  team: Partial<Omit<Team, "id">>,
  req: Request,
): Promise<Team | undefined> =>
  updateRows<Team>("team", id, [team], req).then((r) => r?.[0]);
