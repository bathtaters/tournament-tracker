import type { RequestHandler } from "express";
import type { Match, MatchDetail, Player } from "types/models";
import type {
  EventOpps,
  OppData,
  Stats,
  TeamRelations,
} from "types/generators";
import { matchedData } from "express-validator";
import logger from "../utils/log.adapter";

// Models
import * as event from "../db/models/event";
import * as player from "../db/models/player";
import * as match from "../db/models/match";
import * as team from "../db/models/team";

// Services/Utils
import toStats from "../services/stats.services";
import { arrToObj } from "../utils/shared.utils";
import { creditsPerRank, didntPlayCredits } from "../config/constants";

// Get Event Stats //

export const getAllStats: RequestHandler = async (_, res) => {
  const [matches, players, opps, teams] = await Promise.all([
    match.getAll(true).then(matchesByEvent),
    player.list(),
    event.getOpponents(null, true).then(oppsByEvent),
    team.getRelations().then(arrToObj("id", { valKey: "players" })),
  ]);

  return withMissingEventIds(
    toStats(matches, players, opps, teams, false),
  ).then(res.sendAndLog);
};

export const getStats: RequestHandler = async (req, res) => {
  const { id } = matchedData(req);
  const players = await event.getPlayers(id).then((r) => r?.players);
  if (!players) return res.sendStatus(204);

  const [matches, opps, teams] = await Promise.all([
    match.getByEvent(id),
    event.getOpponents(id).then(arrToObj("playerid", { valKey: "oppids" })),
    team.getRelations(id).then(arrToObj("id", { valKey: "players" })),
  ]);

  return res.sendAndLog(
    toStats({ [id]: matches }, players, { [id]: opps }, teams, true),
  );
};

const getEventCredits = (
  id: Match["eventid"],
  matches: MatchDetail[],
  players: Match["players"],
  opps: Record<Player["id"], Player["id"][]>,
  teams: TeamRelations = {},
  credits: Record<Player["id"], Player["credits"]> = {},
) => {
  const { ranking } = toStats(
    { [id]: matches },
    players,
    { [id]: opps },
    teams,
    true,
  );
  if (!ranking?.length) return credits;

  players.forEach((player) => {
    if (!credits[player]) credits[player] = 0;

    credits[player] += ranking.includes(player)
      ? creditsPerRank[ranking.indexOf(player)]
      : didntPlayCredits;
  });

  return credits;
};

export const resetAllCredits = (includeFinished = false): RequestHandler =>
  includeFinished
    ? async function resetAllCredits(req, res) {
        const [matches, players, opps, teams] = await Promise.all([
          match.getAll(true).then(matchesByEvent),
          player.list(),
          event.getOpponents(null, true).then(oppsByEvent),
          team.getRelations().then(arrToObj("id", { valKey: "players" })),
        ]);

        let credits = {};

        for (const id in matches) {
          getEventCredits(id, matches[id], players, opps[id], teams, credits);
        }

        for (const id in credits) {
          await player.set(id, { credits: credits[id] }, req);
        }
        return res.sendAndLog(credits);
      }
    : async function resetAllCredits(req, res) {
        let credits = {};
        const players = await player.list();

        for (const id of players) {
          credits[id] = 0;
          await player.set(id, { credits: 0 }, req);
        }
        return res.sendAndLog(credits);
      };

export const setCredits = (undo = false): RequestHandler =>
  async function setCredits(req, res) {
    const { id } = matchedData(req);
    const players = await event.getPlayers(id).then((r) => r?.players);
    if (!players) return res.sendStatus(204);

    const [allPlayers, matches, opps, teams] = await Promise.all([
      player.getAll(),
      match.getByEvent(id),
      event
        .getOpponents(id)
        .then(arrToObj("playerid", { valKey: "oppids" })) as Promise<
        Record<Player["id"], Player["id"][]>
      >,
      team.getRelations(id).then(arrToObj("id", { valKey: "players" })),
    ]);

    let eventCredits = getEventCredits(id, matches, players, opps, teams);

    for (const { id, credits } of allPlayers) {
      if (!(id in eventCredits)) eventCredits[id] = didntPlayCredits;
      await player.set(
        id,
        { credits: credits + (undo ? -eventCredits[id] : eventCredits[id]) },
        req,
      );
    }
    return res.sendAndLog(eventCredits);
  };

// HELPERS - statsGetAll - index opps/matches by event
const oppsByEvent = (opps: EventOpps[]) =>
  opps.reduce(
    (obj, entry) => {
      if (!obj[entry.eventid]) obj[entry.eventid] = {};
      else if (obj[entry.eventid][entry.playerid])
        logger.error(
          "Duplicate player opponent objects:",
          entry,
          obj[entry.eventid][entry.playerid],
        );

      obj[entry.eventid][entry.playerid] = entry.oppids;
      return obj;
    },
    {} as Record<EventOpps["eventid"], OppData>,
  );

const matchesByEvent = (matches: MatchDetail[]) =>
  matches &&
  matches.reduce(
    (obj, entry) => {
      if (!obj[entry.eventid]) obj[entry.eventid] = [entry];
      else obj[entry.eventid].push(entry);
      return obj;
    },
    {} as Record<Match["eventid"], MatchDetail[]>,
  );

async function withMissingEventIds(stats: Stats) {
  if (!stats?.ranking) return stats;

  // Collect missing ids
  const playerids = stats.ranking.filter((pid) => !(pid in stats));
  if (!playerids.length) return stats;

  // Get missing player events
  const playerEvents = await player.getPlayerEvents(playerids);
  if (!playerEvents) return stats;

  // Create statsEntries for missing players
  playerEvents.forEach((eventids, idx) => {
    if (!eventids?.length || !playerids[idx]) return;
    stats[playerids[idx]] = { eventids };
  });

  return stats;
}
