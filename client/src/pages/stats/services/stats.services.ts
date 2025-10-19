// Build a playerid list from rank (Include missing players if listAll=true)
import type { Player } from "types/models";

export const getPlayerList = (
  ranking: Player["id"][],
  players: Record<Player["id"], Player>,
  listAll = false,
  hideHidden = false,
) => {
  if (!players) return ranking || [];

  let list = ranking
    ? ranking.filter((p) => players[p])
    : listAll
      ? Object.keys(players)
      : [];

  if (listAll && ranking)
    list.push(...Object.keys(players).filter((p) => !ranking.includes(p)));

  return hideHidden ? list.filter((p) => !players[p].hide) : list;
};
