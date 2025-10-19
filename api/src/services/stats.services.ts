// Calculate records from DB data
import type { MatchDetail, Player } from "types/models";
import type {
  OppData,
  Stats,
  StatsEntryBase,
  StatsEntryOpps,
  StatsEntryRates,
  TeamRelations,
} from "types/generators";
import {
  calcBase,
  calcOpps,
  calcRates,
  combineFinal,
  combineStats,
  finalize,
  getWLD,
  rankSort,
} from "../utils/stats.utils";

/**
 * Get Player Stats & Determine Rankings
 * @param matchData - { eventid: [{ reported, players, wins, draws, maxwins, totalwins }, ...], ... }
 * @param originalOrder - [ playerids, ... ]
 * @param oppData - { eventid: { playerid: [ oppids, ... ], ... }, ... }
 * @param teamRelations - { teamid/playerid: [ playerids/teamsids, ... ], ... }
 * @param useMatchScore - use matchScore (Within same event) vs. percent (Comparing apples to oranges)
 * @param usePercentFloor - round down on percents, should be used only when determining pairings (See /config/constants {points.floor})
 * @returns - { ranking: [ playerids... ], playerid: { ...playerStats }, ... }
 */
function stats(
  matchData,
  originalOrder,
  oppData,
export default function toStats(
  matchData: Record<MatchDetail["eventid"], MatchDetail[]>,
  originalOrder: MatchDetail["players"],
  oppData: Record<MatchDetail["eventid"], OppData>,
  useMatchScore = true,
  usePercentFloor = false,
) {
  const comboStats = {} as Record<Player["id"], StatsEntryOpps>;

  // Each event
  for (const event in matchData) {
    const baseStats = {} as Record<Player["id"], StatsEntryBase>;

    // Get base data from each match (skip if not reported)
    for (const match of matchData[event]) {
      if (!match.reported) continue;
      // Get [W,L,D] indexes
      const results = getWLD(match);

      // Each player
      match.players.forEach((player, playerIdx) => {
        baseStats[player] = baseStats[player]
          ? // Combine entry
            combineStats([
              baseStats[player],
              calcBase(playerIdx, results, match, event),
            ])
          : // New entry
            calcBase(playerIdx, results, match, event);
      });
    }

    // Calculate match/game rates
    const rateStats = {} as Record<Player["id"], StatsEntryRates>;
    for (const player in baseStats) {
      rateStats[player] = calcRates(baseStats[player], usePercentFloor);
    }

    // Append opp match/game rates, combining with other events
    for (const player in rateStats) {
      comboStats[player] = comboStats[player]
        ? // Combine entry
          combineFinal([
            comboStats[player],
            calcOpps(
              rateStats[player],
              rateStats,
              oppData[event][player],
              usePercentFloor,
            ),
          ])
        : // New entry
          calcOpps(
            rateStats[player],
            rateStats,
            oppData[event][player],
            usePercentFloor,
          );
    }
  }

  // Finalize records
  Object.keys(final).forEach(
    (player) => (final[player] = finalize(final[player], usePercentFloor)),
  );
  // Finalize records, conform to 'StatsEntry'
  const final = {} as Stats;
  for (const player in comboStats) {
    final[player] = finalize(comboStats[player], usePercentFloor);
  }

  // Rank players
  final.ranking = (
    originalOrder ? originalOrder.slice() : Object.keys(final)
  ).sort(rankSort(final, originalOrder, useMatchScore));

  return final;
}
