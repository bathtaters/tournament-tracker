import type { Event, Match, Player } from "../../types/models";
import type { MatchupData, TeamData } from "../../types/generators";
import {
  randomGroup,
  randomTeamGroup,
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
      ? randomTeamGroup(teams, playerspermatch).map(sortByKey(teams))
      : randomGroup(players, playerspermatch);

  players = shuffle(players); // Randomize array initially

  // Pair players based on historical match data
  const remaining = new Set(players);
  const matches: Match["players"][] = [];
  while (remaining.size) {
    // Start match with next player
    const match = [remaining.values().next().value];
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
