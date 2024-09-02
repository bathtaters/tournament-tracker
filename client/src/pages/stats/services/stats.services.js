// Build a playerid list from rank (Include missing players if listAll=true)
export const getPlayerList = (ranking, players, listAll=false, hideTeams=false, hideHidden=false) => {
  if (!players) return ranking || []

  let list = ranking ? ranking.filter(p => players[p]) : listAll ? Object.keys(players) : []

  if (listAll && ranking) list.push(...Object.keys(players).filter(p => !ranking.includes(p)))

  if (hideHidden) list = list.filter((p) => !players[p].hide)

  return hideTeams ? list.filter(p => !players[p].isteam) : list
}