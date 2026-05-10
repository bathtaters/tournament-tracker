import type { RequestHandler } from "express";
import type { Match, MatchDetail, MatchReport, Player } from "types/models";
import { matchedData } from "express-validator";
import * as match from "../db/models/match";
import { arrToObj } from "../utils/shared.utils";
import { defaults } from "../config/validation";

// Create an empty report object
const emptyReport = (): Omit<MatchReport, "id" | "eventid"> => ({
  wins: defaults.match.wins.slice(),
  draws: defaults.match.draws,
  drops: defaults.match.drops.slice(),
  reported: true,
});

/* GET match database. */
export const getAllMatches: RequestHandler = (_, res) =>
  match.get().then(res.sendAndLog);

export const getEventMatches: RequestHandler = async (req, res) => {
  const matchData: Record<MatchDetail["id"], CompleteMatch> = await match
    .getByEvent(matchedData<Pick<Match, "eventid">>(req).eventid)
    .then(arrToObj("id", { delKey: false }));
  if (matchData)
    Object.values(matchData).forEach(
      (m) => (m.isDraw = m.wins.filter((w) => w === m.maxwins).length !== 1),
    );
  return res.sendAndLog(matchData ?? {});
};

/* SET match database. */

// Report match
//   { players: {playerid: wincount, ...} , draws: drawCount, drops: [droppedPlayers] }
export const reportMatch: RequestHandler = async (req, res) => {
  const { id, ...body } = matchedData<Partial<MatchReport>>(req);
  const ret = await match.update(id, { ...emptyReport(), ...body }, req);
  return res.sendAndLog({ id, eventid: ret && ret.eventid });
};

// Clear report
export const clearMatch: RequestHandler = async (req, res) => {
  // Get player names
  const { id } = matchedData<Pick<Match, "id">>(req);
  const matches = await match.get(id, false, ["players", "eventid"]);
  if (!matches) throw new Error("Match not found or invalid.");

  // zero-out wins, set reported
  await match.update(
    id,
    {
      ...emptyReport(),
      wins: (matches.players || []).map(() => 0),
      reported: false,
    },
    req,
  );

  return res.sendAndLog({ id, eventid: matches.eventid });
};

// Update partial report data
export const updateMatch: RequestHandler = async (req, res) => {
  const { id, ...body } = matchedData<UpdateMatchBody>(req);

  if (!body.key || !("value" in body))
    throw new Error("No match data provided to update.");

  // Update wins array
  let ret: Match;
  const idx = body.key.match(/^wins\.(\d+)$/);
  /* wins.# value is required to be a number from validation */
  if (idx) ret = await match.updateWins(id, +idx[1], body.value as number, req);
  // Update non 'wins' data
  else ret = await match.update(id, { [body.key]: body.value }, req);

  // Return match & event IDs
  return res.sendAndLog({ id, eventid: ret?.eventid });
};

// Drop/Undrop Player
export const updateDrops: RequestHandler = async (req, res) => {
  const { id, playerid, undrop } = matchedData<UpdateDropBody>(req);

  if (!playerid)
    throw new Error("Not enough data provided to drop/undrop player.");

  // Add/Remove player to drop
  const ret = await match.dropPlayer(id, playerid, !undrop, req);

  // Return match & event IDs
  return res.sendAndLog({ id, eventid: ret?.eventid });
};

// Validation Types

export type CompleteMatch = MatchDetail & { isDraw: boolean };

export type UpdateMatchBody = {
  id: Match["id"];
  key: keyof Match | `${keyof Match}.${number}`;
  value?: Match[keyof Match];
};

export type UpdateDropBody = {
  id: Match["id"];
  playerid: Player["id"];
  undrop?: boolean;
};
