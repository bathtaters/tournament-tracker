import type {
  EventOpps,
  MatchupData,
  OppData,
  Stats,
  StatsEntry,
} from "types/generators";
import type { Player, Team } from "types/models";
import { avg, count, diff } from "./matchGen.utils";

// --- SPECIFIC SETTINGS --- \\

// Stats weighting for calculations
const weight = {
  teamPenalty: 1000000000005,
  penalty: 10000000004, // 1x per rematch, 2x per bye
  matchRate: 100000003,
  oppMatch: 1000002,
  gameRate: 10001,
  oppGame: 100,
  matchups: 0.001,
};

// Force to always use fastAlgorithm
export const useFastAlgorithm = false;

/** Convert each match array to a numeric score to help align ideal matches w/ proposed matches
 *    This value will be used to sort the matches, then they will be matched based on their indexes once sorted. */
const getMatchScore = (matchScores: number[]) =>
  !matchScores.length ? 0 : Math.max(...matchScores); // Highest score
// Math.min(...matchScores); // Lowest score
// avg(matchScores); // Average scores
// avg([Math.min(...matchScores), Math.max(...matchScores)]); // Range median

/** Tie-breaker: Check number of times players played each other in all other events combined. */
const getMatchupCount = (
  allMatchups: MatchupData[],
  playerA: Player["id"],
  playerB: Player["id"],
) =>
  Number(
    allMatchups.find(({ id, opp }) => playerA === id && playerB === opp)
      ?.count || 0,
  );

/** Calculate single player's base score */
export const getPlayerScore = (stats: StatsEntry) =>
  !stats
    ? 0
    : Object.keys(weight).reduce(
        (tot, key) =>
          tot +
          (key in stats && !isNaN(stats[key]) ? stats[key] * weight[key] : 0),
        0,
      );

/** Calculate score of 2 players (base + rematch penalties) */
export const getComboScore = (
  [playerA, playerB]: [Player["id"], Player["id"]],
  scores: { [id: Player["id"]]: number },
  opps: OppData,
  allMatchups: MatchupData[],
  idealMatch: [Player["id"], Player["id"]] | null,
  teams: [Team["id"], Team["id"]] | null,
) =>
  (idealMatch
    ? avg([
        diff(scores[playerA] ?? 0, scores[idealMatch[0]] ?? 0),
        diff(scores[playerB] ?? 0, scores[idealMatch[1]] ?? 0),
      ])
    : diff(scores[playerA], scores[playerB])) +
  (count(playerB, opps?.[playerA]) + count(playerA, opps?.[playerB])) *
    weight.penalty +
  getMatchupCount(allMatchups, playerA, playerB) * weight.matchups +
  (teams && teams[0] === teams[1] ? weight.teamPenalty : 0);

/** Calculate score for single player match (base + bye penalties) */
export const getSoloScore = (
  player: Player["id"],
  score: number,
  byes: Player["id"][],
) => score + count(player, byes) * weight.penalty * 2;

/** Check if a player can be paired (Algorithm B) */
export const canBePaired = (
  player: Player["id"],
  opponents: Player["id"][] = [],
  playerOpps: Player["id"][] = [],
  minCount = 0,
  teamMap?: Record<Player["id"], Team["id"]>,
) =>
  opponents.every(
    (opp) =>
      opp !== player &&
      playerOpps.filter((o) => o === opp).length === minCount &&
      (!teamMap || teamMap[player] !== teamMap[opp]),
  );

/** Get minimum pairings, keyed by player */
export const getMinPairings = (oppData: OppData) =>
  Object.keys(oppData).reduce(
    (acc, player) => {
      acc[player] = Math.min(
        ...Object.keys(oppData).map(
          (opp) => oppData[player].filter((id) => id === opp).length,
        ),
      );
      return acc;
    },
    {} as Record<EventOpps["playerid"], number>,
  );

/** Get opponent with the least amount of previous matchups */
export const getMinMatchups = (
  match: Player["id"][],
  opps: Player["id"][] | Set<Player["id"]>,
  allMatchups: MatchupData[],
) => {
  let minVal = Infinity,
    minOpp;
  for (const opp of opps) {
    const count = match.reduce(
      (sum, player) => sum + getMatchupCount(allMatchups, player, opp),
      0,
    );
    if (count < minVal) {
      minVal = count;
      minOpp = opp;
    }
  }
  return minOpp;
};

/** Sort a match array based on scores */
export const dutchSort = (
  matches: Player["id"][][],
  scores: Record<Player["id"], number>,
) => {
  const matchScores = matches.map((match) =>
    getMatchScore(match.map((id) => scores[id])),
  );
  const sorted = matches
    .map((_, idx) => idx)
    .sort((a, b) => matchScores[b] - matchScores[a]);
  return sorted.map((idx) => matches[idx]);
};

// ----- Logging ------ \\

// Get results as readable object for error reporting
export const resultsLogObject = (
  stats: Stats,
  playerScores: Record<string, number>,
  bestScore: number | string,
) => ({
  bestScore,
  stats,
  playerScores,
  totalCount: stats.ranking.length,
});
