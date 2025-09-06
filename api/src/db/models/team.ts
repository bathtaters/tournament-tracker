import type { Event, Team } from "types/models";
import type { Request } from "express";
import db from "../admin/interface";
import log from "./log";
import { team } from "../sql/strings";

// GETS \\

const get = (id: Team["id"]): Promise<Team> => db.getRow("team", id);

const list = (eventid?: Event["id"]): Promise<Team[]> =>
  eventid
    ? db.getRows("team", team.eventFilter, [eventid])
    : db.getRows("team");

// SETS \\

const add = (
  players: Team["players"],
  name: Team["name"],
  req: Request,
): Promise<Team | undefined> =>
  db
    .operation(async (client: any) => {
      // Test that player IDs are legitness
      const playerCount: number | undefined = await db.getCount(
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
      return log.addRows("team", { players, name }, req, { client });
    })
    .then((r) => (Array.isArray(r) ? r[0] : r));

const rmv = (id: Team["id"], req: Request): Promise<Team | undefined> =>
  log.rmvRows("team", id, null, req);

const set = (
  id: Team["id"],
  team: Partial<Omit<Team, "id">>,
  req: Request,
): Promise<Team | undefined> => log.updateRows("team", id, team, req);

export default { get, list, add, rmv, set };
