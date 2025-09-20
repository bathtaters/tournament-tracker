import type { GenerateData, Stats, StatsReturn } from "types/generators";
import type { Match, Player } from "types/models";
import logger from "../../utils/log.adapter";
import noStatsAlgorithm from "./noStats";
import { avg, findNearest, getGroups, getGroupsSimple } from "./matchGen.utils";
import { getCombinations } from "../../utils/combination.utils";
import { pairingThreshold } from "../../config/meta";
import {
  canBePaired,
  dutchSort,
  getComboScore,
  getMinPairings,
  getPlayerScore,
  getSoloScore,
  resultsLogObject,
  useFastAlgorithm,
} from "./swiss.config";

export default function generateMatchups(
  stats: StatsReturn,
  data: GenerateData,
  isDutch: boolean,
): Match["players"][] {
  // Randomize matches for initial pairing
  if (stats.noStats)
    return noStatsAlgorithm(
      stats.ranking,
      data.playerspermatch,
      data.allMatchups,
    );

  // Pair with simpler algorithm if over threshold
  return useFastAlgorithm || stats.ranking.length > pairingThreshold
    ? fastAlgorithm(stats, data, isDutch)
    : slowAlgorithm(stats, data, isDutch);
}

// -------------------------- SLOW ALGORITHM -------------------------- \\
// Bad time complexity, but more thorough & better for complex scenarios

function slowAlgorithm(
  stats: Stats,
  { playerspermatch, byes, oppData, allMatchups }: GenerateData,
  isDutch: boolean,
): Match["players"][] {
  const players = stats.ranking.slice();

  // Calculate base player scores
  const playerScores = players.reduce(
    (scores, player) => ({
      ...scores,
      [player]: getPlayerScore(stats[player]),
    }),
    {} as Record<Player["id"], number>,
  );
  const idealDutch = isDutch
    ? dutchSort(getGroupsSimple(players, playerspermatch, true), playerScores)
    : null;

  // Iterate over all possible match groupings, finding the lowest score
  let bestMatch = null,
    bestScore = NaN;
  for (let matchList of getGroups(players, playerspermatch)) {
    // Dutch arrays are sorted to simplify comparison with 'idealDutch'
    if (isDutch) matchList = dutchSort(matchList, playerScores);

    const val = avg(
      matchList.map((match, matchIdx) => {
        // Bye match
        if (match.length === 1)
          return getSoloScore(match[0], playerScores[match[0]], byes);

        const idealMatch = idealDutch?.[matchIdx];

        // Standard match (Monrad/Dutch)
        //  If idealDutch is an array get Dutch cost, otherwise get score diff.
        //  Then get the average of each player pair's score.
        let count = 0,
          total = 0;
        for (const nextIndexes of getCombinations(match, 2, true)) {
          total += getComboScore(
            nextIndexes.map((idx) => match[idx]) as [string, string],
            playerScores,
            oppData,
            allMatchups ?? [],
            idealMatch &&
              (nextIndexes.map((idx) => idealMatch[idx]) as [string, string]),
          );
          count++;
        }
        return count ? total / count : 0;
      }),
    );
    if (!isNaN(bestScore) && val >= bestScore) continue;
    bestScore = val;
    bestMatch = matchList;
  }

  // Catch error
  if (!bestMatch) {
    logger.error("SWISS MONRAD Input Data:", stats, {
      playerspermatch,
      byes,
      oppData,
    });
    logger.error(
      "SWISS MONRAD Results:",
      resultsLogObject(stats, playerScores, bestScore),
    );
    throw new Error("SWISS MONRAD failed to find best match pairing.");
  }

  return bestMatch;
}

// -------------------------- FAST ALGORITHM -------------------------- \\
// Better time complexity, but not guaranteed to get the best result.

function fastAlgorithm(
  stats: Stats,
  { playerspermatch, byes, oppData }: GenerateData,
  isDutch: boolean,
): Match["players"][] {
  const players = stats.ranking.slice();
  const matches: Match["players"][] = [];
  const usedPlayers = new Set();
  const byePlayers =
    byes.length < players.length ? new Set(byes ?? []) : new Set();
  const dutchFactor = isDutch
    ? Math.trunc(players.length / playerspermatch)
    : 0;

  // Calculate base player scores
  const playerScores = players.reduce(
    (scores, player) => ({
      ...scores,
      [player]: getPlayerScore(stats[player]),
    }),
    {} as Record<Player["id"], number>,
  );

  // Calculate minimum values
  const minPairings = getMinPairings(oppData);

  // Generate matches
  while (usedPlayers.size < players.length) {
    const match = [];

    for (let slot = 0; slot < playerspermatch; slot++) {
      let player = null;

      // Offset to next 'dutch' group for dutch pairing
      const end =
        Math.min((slot + 1) * dutchFactor, players.length) || players.length;

      for (let playIdx = slot * dutchFactor; playIdx < end; playIdx++) {
        const candidate = players[playIdx];
        if (
          !usedPlayers.has(candidate) &&
          (match.length === 0 ||
            canBePaired(
              candidate,
              match,
              oppData[candidate],
              minPairings[candidate],
            ))
        ) {
          player = candidate;
          break;
        }
      }
      if (player !== null) {
        match.push(player);
        usedPlayers.add(player);
      }
    }
    if (!match.length) break; // No players left
    // Don't create a bye match for a player who already has a bye
    if (match.length > 1 || playerspermatch < 2 || !byePlayers.has(match[0])) {
      matches.push(match);
    } else {
      usedPlayers.delete(match[0]);
    }
  }

  // Slot the remaining players into empty slots
  const remaining = new Set(players.filter((p) => !usedPlayers.has(p)));
  for (const match of matches) {
    if (remaining.size === 0) break;

    while (match.length < playerspermatch && remaining.size > 0) {
      // Find the best candidate to use
      let player = null;
      for (const candidate of remaining) {
        if (
          canBePaired(
            candidate,
            match,
            oppData[candidate],
            minPairings[candidate],
          )
        ) {
          player = candidate;
          break;
        }
      }
      if (player === null) [player] = remaining; // Get first
      match.push(player);
      remaining.delete(player);
    }
  }

  // Ensure all players appear exactly once
  if (remaining.size > 0) {
    logger.error("SWISS MONRAD Input Data:", stats, {
      playerspermatch,
      byes,
      oppData,
    });
    logger.error(
      "SWISS MONRAD Results:",
      resultsLogObject(stats, playerScores, "null (Fast Algo)"),
    );
    logger.error("Algorithm A failed, falling back on no pairing.");
    return getGroupsSimple(players, playerspermatch, isDutch);
  }

  // Fix any byePlayers that were assigned byes
  if (playerspermatch > 1 && byePlayers.size) {
    for (let byeIdx = 0; byeIdx < matches.length; byeIdx++) {
      const byeMatch = matches[byeIdx];
      if (byeMatch.length !== 1 || !byePlayers.has(byeMatch)) continue;

      const byePlayer = byeMatch[0];

      // Find the nearest player w/o a bye that can be swapped with the byePlayer
      let swapMatch: string[];
      const swapPlayer = findNearest(
        players,
        players.indexOf(byePlayer),
        (player) => {
          if (byePlayers.has(player)) return false;

          swapMatch = matches.find((match) => match.includes(player));
          if (!swapMatch) return false;
          // Check match minus the swap player
          return canBePaired(
            byePlayer,
            swapMatch.filter((p) => p !== player),
            oppData[byePlayer],
            minPairings[byePlayer],
          );
        },
      );

      if (!swapPlayer || !swapMatch) continue;
      const swapIdx = swapMatch.indexOf(swapPlayer);
      if (swapIdx === -1) continue;
      // Swap players
      byeMatch[0] = swapPlayer;
      swapMatch[swapIdx] = byePlayer;
    }
  }

  return matches;
}
