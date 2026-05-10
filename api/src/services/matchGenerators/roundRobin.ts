import type { GenerateData, StatsReturn } from "types/generators";
import type { Match } from "types/models";
import logger from "../../utils/log.adapter";
import noStatsAlgorithm from "./noStats";
import { count, getGroups, invertArrayObj } from "./matchGen.utils";
import { getCombinations } from "../../utils/combination.utils";

export default function generateMatchups(
  stats: StatsReturn,
  { playerspermatch, byes, teamData, oppData, allMatchups }: GenerateData,
): Match["players"][] {
  // Do a simple pairing for the first round
  if (stats.noStats)
    return noStatsAlgorithm(
      stats.ranking,
      playerspermatch,
      allMatchups,
      teamData,
    );

  const players: string[] = stats.ranking.slice();
  const teamMap = teamData && invertArrayObj(teamData);

  // Iterate over all possible match groupings, finding the lowest score
  let bestMatch = null,
    bestScore = NaN;

  for (const matchList of getGroups(players, playerspermatch)) {
    let groupScore = 0,
      hasTeamMatch = false;

    for (const match of matchList) {
      // Bye match
      if (match.length === 1) {
        groupScore += count(match[0], byes);
        continue;
      }

      // Count each rematch
      let comboCount = 0,
        rematchCount = 0;
      for (const nextPlayers of getCombinations(match, 2)) {
        if (teamMap && teamMap[nextPlayers[0]] === teamMap[nextPlayers[1]]) {
          hasTeamMatch = true;
          break;
        }

        rematchCount +=
          count(nextPlayers[1], oppData?.[nextPlayers[0]]) +
          count(nextPlayers[0], oppData?.[nextPlayers[1]]);

        comboCount++;
      }
      if (hasTeamMatch) break; // Short-circuit if teammates are matched
      if (comboCount) groupScore += rematchCount / comboCount;
    }
    if (hasTeamMatch) continue;

    groupScore /= matchList.length; // Get average
    if (isNaN(bestScore) || groupScore < bestScore) {
      bestScore = groupScore;
      bestMatch = matchList;
      if (bestScore === 0) break; // Short-circuit if round contains no rematches
    }
  }

  // Catch error
  if (!bestMatch) {
    logger.error("ROUND ROBIN Data:", stats, {
      playerspermatch,
      byes,
      oppData,
      bestScore,
    });
    throw new Error("ROUND ROBIN failed to find best match pairing.");
  }

  return bestMatch;
}
