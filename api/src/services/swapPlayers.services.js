// -- Swap Players/Wins/Drops between matches -- //
const { updateFilter, swapArrays, moveArrays, getOtherIdx } = require('../utils/swapPlayers.utils');

// Returns updated matchData using swapData
function swapPlayersService(matchData, swapData) {
  // Get data
  matchData.forEach((data, i) => {
    const playerid = swapData[i].playerid
    data.idx = data.players.indexOf(playerid)
    if (data.idx === -1)
      throw new Error("Player is not registered for match: "+playerid)
    data.dropIdx = data.drops.indexOf(playerid)
  });

  // Swap players
  swapArrays(matchData, 'players', 'idx')
  swapArrays(matchData, 'wins',    'idx')

  // Swap drops (if any)
  matchData.forEach((data, i) => {
    if (data.dropIdx !== -1) {
      const to = getOtherIdx(i)

      if (matchData[to].reported !== false) {
        // If reported, move drop to destination
        moveArrays(data, matchData[to], 'drops', 'dropIdx')
        matchData[to].saveDrops = true
      }
      // If not-reported, remove drop from source
      else data.drops.splice(data.dropIdx,1)
        
      data.saveDrops = true
    }
  });

  // Filter out unneeded data
  return matchData.map(updateFilter)
}

module.exports = swapPlayersService;