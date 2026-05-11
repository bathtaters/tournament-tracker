// Check if player already exists in list
import type { EventFormat, Player, Team } from "types/models";

export const playerExists = (
  player: Player["name"],
  allPlayers: Record<Player["id"], Player>,
) => {
  const lower = player.toLowerCase();
  return Object.values(allPlayers).some((p) => p.name.toLowerCase() === lower);
};

// Randomizes an array, optionally trimming it to a specific size
export const randomArray = <T>(arr: T[], size?: number) => {
  if (typeof size !== "number" || size > arr.length) size = arr.length;
  let res: T[] = [],
    rem = arr.slice();
  for (let i = 0; i < size; i++) {
    res.push(rem.splice(Math.floor(Math.random() * rem.length), 1)[0]);
  }
  return res;
};

// Gets the related playerIds from an array of teamIds
export const getTeamPlayers = (
  teamIds: Team["id"][],
  teams: Record<Team["id"], Team>,
) => teamIds.flatMap((teamId) => teams[teamId]?.players ?? []);

/** Suggested round count for a given format, competitor count, and players-per-match.
 *  Returns null for formats with no canonical recommendation. */
export const recommendedRoundCount = (
  format: EventFormat | null | undefined,
  competitorCount: number | undefined,
  playersPerMatch: number | undefined = 2,
): number | null => {
  if (!competitorCount || competitorCount < 2) return null;
  if (!playersPerMatch || playersPerMatch < 2) return null;
  switch (format) {
    case "ROBIN":
      return Math.ceil((competitorCount - 1) / (playersPerMatch - 1));
    case "ELIM":
      return Math.ceil(
        Math.log(competitorCount) / Math.log(playersPerMatch),
      );
    default:
      return null;
  }
};
