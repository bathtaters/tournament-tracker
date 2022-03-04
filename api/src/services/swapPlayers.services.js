// -- Swap Players/Wins/Drops between matches -- //
const { updateFilter, swapArrays, moveArrays, getOtherIdx } = require('../utils/swapPlayers.utils');

// Get unique IDs (For DB access)
const getUnique = (data, key) => data.reduce((res,entry) =>
  res.includes(entry[key]) ? res : res.concat(entry[key]
), [])


// Returns updated matchData using swapData
function swapPlayersService(matchData, swapData) {
  // Get data
  swapData.forEach((data, i) => {
    data.matchIdx = i - +!matchData[i]
    data.playerIdx = matchData[data.matchIdx].players.indexOf(data.playerid)
    if (data.playerIdx === -1) throw new Error("Player is not registered for match: "+data.playerid)
    data.dropIdx = matchData[data.matchIdx].drops.indexOf(data.playerid)
  });

  // Swap players
  swapArrays(swapData, matchData, 'players', 'matchIdx', 'playerIdx')
  swapArrays(swapData, matchData,    'wins', 'matchIdx', 'playerIdx')

  // Swap drops (if any)
  swapData.forEach((data, i) => {
    if (data.dropIdx === -1) return
    const to = getOtherIdx(i)
    if (!matchData[i] || !matchData[to]) return

    if (matchData[to].reported !== false) {
      // If reported, move drop to destination
      moveArrays(matchData, i, to, 'drops', data.dropIdx)
      matchData[to].saveDrops = true
    }
    // If not-reported, remove drop from source
    else matchData[i].drops.splice(data.dropIdx,1)
      
    matchData[i].saveDrops = true
  });

  // Filter out unneeded data
  return matchData.map(updateFilter)
}

module.exports = { swapPlayersService, getUnique };