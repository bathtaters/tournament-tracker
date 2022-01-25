// Swap Players/Wins/Drops between matches //


// Filter applied to update object that is passed back to controller
const updateFilter = ({ id, players, wins, drops }, includeDrops = true) =>
  includeDrops ? { id, players, wins, drops } : { id, players, wins };


// Update matchData to swap players from swapData
function swapPlayersService(matchData, swapData) {
  // Get data
  matchData.forEach((data, i) => {
    const playerId = swapData[i].playerId;
    data.idx = data.players.indexOf(playerId);
    if (data.idx === -1) throw new Error("Player is not registered for match: "+playerId);
    data.dropIdx = data.drops ? data.drops.indexOf(playerId) : -1;
  });

  // Swap players
  swapArrays(matchData, 'players', 'idx');
  swapArrays(matchData, 'wins',    'idx');

  // Swap drops (if any)
  if (matchData[0].dropIdx !== -1) {
    moveArrays(matchData[0], matchData[1], 'drops', 'dropIdx');
    matchData[1].saveDrops = true;
  }
  if (matchData[1].dropIdx !== -1) {
    moveArrays(matchData[1], matchData[0], 'drops', 'dropIdx');
    matchData[0].saveDrops = true;
  }

  // Filter out unneeded data
  return matchData.map(data => updateFilter(data, data.saveDrops));
}


// HELPER - Swaps item from baseArr[0][swapkey] to baseArr[1][swapkey] using indexes: baseArr[n][idxKey]
const swapArrays = (baseArr, swapKey, idxKey = 'idx') =>
  [ baseArr[0][swapKey][baseArr[0][idxKey]], baseArr[1][swapKey][baseArr[1][idxKey]] ] =
  [ baseArr[1][swapKey][baseArr[1][idxKey]], baseArr[0][swapKey][baseArr[0][idxKey]] ];


// HELPER - Moves item in fromArr[moveKey] @ index fromArr[idxKey] to end of toArr[moveKey]
const moveArrays = (fromArr, toArr, moveKey = 'drops', idxKey = 'dropIdx') =>
  toArr[moveKey].push(fromArr[moveKey].splice(fromArr[idxKey],1)[0]);

module.exports = swapPlayersService;