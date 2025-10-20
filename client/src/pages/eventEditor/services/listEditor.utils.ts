// Check if player already exists in list
import type { Player, Team } from "types/models";

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
