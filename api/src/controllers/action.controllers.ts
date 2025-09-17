import type { Request, Response } from "express";
import type { Match, Player } from "types/models";
import type { OppData, TeamData } from "types/generators";
import { matchedData } from "express-validator";

import * as event from "../db/models/event";
import * as match from "../db/models/match";
import * as clock from "../db/models/clock";
import * as settings from "../db/models/settings";
import * as teams from "../db/models/team";

import { asType } from "../services/settings.services";
import { defaults, enums } from "../config/validation";
import roundService from "../services/round.services";
import {
  getUniqueIds,
  swapPlayersService,
} from "../services/swapPlayers.services";
import { arrToObj } from "../utils/shared.utils";

const { TeamType } = enums;

type SwapData = {
  swap: { id: Match["id"]; matchIdx: number; playerid: Player["id"] }[];
};

// Swap players in matches
export async function swapPlayers(req: Request, res: Response) {
  // Get data
  const { swap } = matchedData(req) as SwapData;
  let matchData = await match.getMulti(getUniqueIds(swap, "id"), false, [
    "id",
    "eventid",
    "players",
    "wins",
    "drops",
    "reported",
  ]);

  // Error check
  if (!matchData?.length || matchData.some((m) => !m || !m.players))
    throw new Error("Matches not found or are invalid.");

  const eventid = matchData[0].eventid;
  if (matchData.some((m) => eventid !== m.eventid))
    throw new Error("Cannot swap players from different events.");

  // Mutate match data
  matchData = swapPlayersService(matchData, swap);

  // Write changes
  const result = await match.updateMulti(matchData, req);
  if (!result?.length || result.some((r) => r.eventid !== eventid))
    throw new Error("Error writing swap to database.");

  return res.sendAndLog({ eventid });
}

// Create round matches
export async function nextRound(req: Request, res: Response) {
  const { id, roundactive } = matchedData<{ id: string; roundactive: number }>(
    req,
  );
  const data = await event.get(id, true);

  // Error check
  if (!data) throw new Error("Event not found: " + id);

  if (data.roundactive + 1 !== roundactive)
    throw new Error("Received too many round change requests.");

  if (
    !data.players ||
    !data.players.length ||
    (data.drops && data.drops.length >= data.players.length)
  )
    throw new Error("No active players are registered");

  if (data.roundactive > data.roundcount) throw new Error("Event is over");

  if (data.roundactive && !data.allreported)
    throw new Error("All matches have not been reported");

  // Get additional data
  const [matchData, oppData, allMatchups, autoByes, teamData] =
    await Promise.all([
      match.getByEvent(id),
      event
        .getOpponents(id)
        .then(arrToObj("playerid", { valKey: "oppids" })) as Promise<OppData>,
      match.getMatchups(id),
      settings.get(["autobyes"]).then((r) => r?.[0]),
      data.team !== TeamType.DISTRIB
        ? null
        : (teams
            .list(id)
            .then(arrToObj("id", { valKey: "players" })) as Promise<TeamData>),
    ]);

  // Build round
  const { eventid, round, matches } = roundService(
    data,
    matchData,
    oppData,
    allMatchups,
    teamData,
    autoByes ? asType(autoByes) : defaults.settings.autobyes,
  );

  // Create matches
  const ret = await event.pushRound(eventid, round, matches, req);
  if (!Array.isArray(ret) || !ret[0])
    throw new Error("Error adding round to database");

  await clock.reset(id, req);

  return res.sendAndLog({
    id: ret[0].id,
    round: ret[0].roundactive,
    matches: ret[1]?.map((m) => m.id),
  });
}

// Delete round matches
export async function prevRound(req: Request, res: Response) {
  const { id, roundactive } = matchedData<{ id: string; roundactive: number }>(
    req,
  );

  const round = await event.getRound(id); // Get latest round num
  if (round == null) throw new Error("No matches found.");

  if (round !== roundactive)
    throw new Error("Received too many round change requests.");

  await event.popRound(id, round, req);

  await clock.reset(id, req);

  return res.sendAndLog({ id, round });
}
