// Swap Players/Wins/Drops between matches //


// Filter applied to update object that is passed back to controller
const updateFilter = ({ id, players, wins, drops, saveDrops }) =>
  saveDrops ?
    { id, players, wins, drops } :
    { id, players, wins }


// Update matchData to swap players from swapData
function swapPlayersService(matchData, swapData) {
  // Get data
  matchData.forEach((data, i) => {
    const playerId = swapData[i].playerId
    data.idx = data.players.indexOf(playerId)
    if (data.idx === -1)
      throw new Error("Player is not registered for match: "+playerId)
    data.dropIdx = data.drops.indexOf(playerId)
  });

  // Swap players
  swapArrays(matchData, 'players', 'idx')
  swapArrays(matchData, 'wins',    'idx')

  // Swap drops (if any)
  matchData.forEach((data, i) => {
    if (data.dropIdx !== -1) {
      const to = getOtherIdx(i)
      moveArrays(data, matchData[to], 'drops', 'dropIdx')
      matchData[to].saveDrops = true
    }
  });

  // Filter out unneeded data
  return matchData.map(data => updateFilter(data))
}


// HELPER - get index that item will be swapped with (0=1, 1=0, 2=3, 3=2, ...)
// const getOtherIdx = idx => idx + (idx % 2 ? -1 : 1)
const getOtherIdx = idx => idx ? 0 : 1 // QUICK METHOD

// HELPER - Swaps item from baseArr[0][swapkey] to baseArr[1][swapkey] using indexes: baseArr[n][idxKey]
const swapArrays = (baseArr, swapKey, idxKey = 'idx', idxA = 0) => {
  const idxB = getOtherIdx(idxA);
  [ 
    baseArr[idxA][swapKey][baseArr[idxA][idxKey]],
    baseArr[idxB][swapKey][baseArr[idxB][idxKey]],
  ] = [
    baseArr[idxB][swapKey][baseArr[idxB][idxKey]],
    baseArr[idxA][swapKey][baseArr[idxA][idxKey]],
  ]
}

// HELPER - Moves item in fromArr[moveKey] @ index fromArr[idxKey] to end of toArr[moveKey]
const moveArrays = (fromArr, toArr, moveKey = 'drops', idxKey = 'dropIdx') =>
  toArr[moveKey].push(fromArr[moveKey].splice(fromArr[idxKey],1)[0])


module.exports = swapPlayersService;