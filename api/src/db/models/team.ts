import type { Event, Team } from "types/models";
import type { Request } from "express";
import { getCount, getRow, getRows, operation } from "../admin/interface";
import { addRows, query, rmvRows, SYSTEM_REQ, updateRows } from "./log";
import { rmvPlayer } from "./event";
import { team as strings } from "../sql/strings";

// GETS \\

export const get = (id: Team["id"]): Promise<Team> => getRow<Team>("team", id);

export const list = (eventid?: Event["id"]): Promise<Team[]> =>
  eventid
    ? getRows<Team>("team", strings.eventFilter, [eventid])
    : getRows<Team>("team");

export const getRelations = (eventid?: Event["id"]) =>
  query<Pick<Team, "id" | "players">>(
    eventid ? strings.eventRelations : strings.allRelations,
    eventid ? [eventid] : [],
  );

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
  }).then((r) => r?.[0]);

export const rmv = (id: Team["id"], req: Request): Promise<Team | undefined> =>
  operation(async (client) => {
    const team = await rmvRows<Team>("team", id, null, req, client).then(
      (r) => r?.[0],
    );
    if (team?.id) await rmvPlayer(team.id, req, client);
    return team;
  });

export const set = (
  id: Team["id"],
  team: Partial<Omit<Team, "id">>,
  req: Request,
): Promise<Team | undefined> =>
  updateRows<Team>("team", id, team, req).then((r) => r?.[0]);

/** Find any teams that are missing events and remove them */
export const clean = () =>
  rmvRows<Team>("team", [], strings.cleanupFilter, SYSTEM_REQ).then(
    (r) => r?.length ?? 0,
  );
