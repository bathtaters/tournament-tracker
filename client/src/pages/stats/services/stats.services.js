// Build a playerid list from rank (Include missing players if listAll=true)
export const getPlayerList = (ranking, players, listAll=false, hideTeams=false) => {
  if (!players) return ranking || [];
  let list = [];
  if (ranking) {
    list = ranking.filter(p => players[p]);
    if (listAll) list.push(...Object.keys(players).filter(p => !ranking.includes(p)));
  } else if (listAll) list.push(...Object.keys(players));
  return hideTeams ? list.filter(p => !players[p].isteam) : list;
}