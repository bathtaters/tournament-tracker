// Build a playerid list from rank (Include missing players if listAll=true)
export const getPlayerList = (
  ranking,
  players,
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
