import type { Event, Match, Player } from "../../types/models";
import type { MatchupData } from "../../types/generators";
import { randomGroup } from "./matchGen.utils";
import { shuffle } from "../../utils/shared.utils";
import { getMinMatchups } from "./swiss.config";

export default function noStatsAlgorithm(
  players: Player["id"][],
  playerspermatch: Event["playerspermatch"],
  allMatchups: MatchupData[],
): Match["players"][] {
  // If no data provided, do a completely random pairing
  if (!allMatchups?.length) return randomGroup(players, playerspermatch);

  players = shuffle(players); // Randomize array initially

  // Pair players based on historical match data
  const remaining = new Set(players);
  const matches: Match["players"][] = [];
  while (remaining.size) {
    // Start match with next player
    const match = [remaining.values().next().value];
    remaining.delete(match[0]);
    // Add best matches until match is full, or you run out of players
    while (match.length < playerspermatch && remaining.size) {
      const opp = getMinMatchups(match, remaining, allMatchups);
      match.push(opp);
      remaining.delete(opp);
    }
    if (match.length) matches.push(match);
  }

  return matches;
}
