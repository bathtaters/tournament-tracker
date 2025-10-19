// Build a playerid list from rank (Include missing players if listAll=true)
import type { Player, Team } from "types/models";

export const getPlayerList = (
  ranking: Player["id"][],
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team> = {},
  listAll = false,
  hideHidden = false,
) => {
  if (!players) return ranking || [];

  let list = ranking
    ? ranking.filter((p) => p in players || p in teams)
    : listAll
      ? Object.keys(players)
      : [];

  if (listAll && ranking)
    list.push(...Object.keys(players).filter((p) => !ranking.includes(p)));

  return hideHidden ? list.filter((p) => !players[p].hide) : list;
};
