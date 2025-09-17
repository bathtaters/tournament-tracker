import type { GenerateData, StatsReturn } from "types/generators";
import type { Match } from "types/models";

export default function generateMatchups(
  stats: StatsReturn,
  { team, playerspermatch, byes, teamData, oppData, allMatchups }: GenerateData,
): Match["players"][] {
  // TODO: Initial pairing
  if (stats.noStats) return [];

  // TODO: Generate pairings (Consider distributed team matchups as well)
  return [];
}
