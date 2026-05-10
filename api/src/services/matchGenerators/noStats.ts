import type { Event, Match, Player, Team } from "../../types/models";
import type { MatchupData, TeamData } from "../../types/generators";
import {
  groupArray,
  groupTeamArray,
  removeTeam,
  sortByKey,
} from "./matchGen.utils";
import { shuffle } from "../../utils/shared.utils";
import { getMinMatchups } from "./swiss.config";

export default function noStatsAlgorithm(
  players: Player["id"][],
  playerspermatch: Event["playerspermatch"],
  allMatchups: MatchupData[],
  teams?: TeamData,
): Match["players"][] {
  // If no data provided, do a completely random pairing
  if (!allMatchups?.length)
    return teams
      ? groupTeamArray(Object.values(teams), playerspermatch).map(
          sortByKey(teams),
        )
      : groupArray(players, playerspermatch);

  players = shuffle(players); // Randomize array initially

  // Pair players based on historical match data
  const remaining = new Set(players);
  const matches: Match["players"][] = [];
  while (remaining.size) {
    // Start match with next player
    const match = [getNextPlayer(remaining, teams)];
    // Add best matches until match is full, or you run out of players
    const opposingPlayers = new Set(remaining);
    removeTeam(match[0], opposingPlayers, teams);
    remaining.delete(match[0]);
    while (match.length < playerspermatch && opposingPlayers.size) {
      const opp = getMinMatchups(match, opposingPlayers, allMatchups);
      match.push(opp);
      removeTeam(opp, opposingPlayers, teams);
      remaining.delete(opp);
    }
    if (match.length) matches.push(match);
  }

  return teams ? matches.map(sortByKey(teams)) : matches;
}

/** Get player from the team with the most remaining players. */
const getNextPlayer = (
  remaining: Set<Player["id"]>,
  teams?: TeamData,
): Player["id"] => {
  // Pick next player
  const defaultPlayer = remaining.values().next().value;
  if (!teams) return defaultPlayer;

  // Find team with the most remaining players
  let maxTeam: Team["id"] = null,
    maxCount = 0;
  for (const team in teams) {
    const count = teams[team].reduce(
      (count, player) => count + +remaining.has(player),
      0,
    );
    if (count > maxCount) {
      maxCount = count;
      maxTeam = team;
    }
  }

  // Find the next available player on the team
  if (!maxCount) return defaultPlayer;
  return teams[maxTeam].find((p) => remaining.has(p)) ?? defaultPlayer;
};
