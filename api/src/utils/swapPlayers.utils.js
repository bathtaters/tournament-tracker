// -- Helpers for SwapPlayers -- \\


/**
 * Get index that item will be swapped with (0=1, 1=0, 2=3, 3=2, ...)
 * NOTE: Currently using 'quick mode' which only works with 2 inputs (0 & 1)
 * @param {Number} idx - Index of item
 * @returns {Number} Index of pair to swap with
 */
// exports.getOtherIdx = idx => idx + (idx % 2 ? -1 : 1) // (If swapping w/ more than 2 inputs)
exports.getOtherIdx = idx => +!idx // QUICK METHOD (For swapping w/ 2 inputs)


/**
 * Filter applied to update object before it is passed back to controller
 * @param {Object} updateData - Each entry in update object
 * @returns {Object} updateData without extraneous fields
 */
exports.updateFilter = ({ id, players, wins, drops, saveDrops }) =>
  saveDrops ?
    { id, players, wins, drops } :
    { id, players, wins }


/**
 * Swaps item from baseArr[0][swapkey] to baseArr[1][swapkey] using indexes: baseArr[n][idxKey]
 * @param {Object[]} baseArr – Object Array to use for swap (ie matchData)
 * @param {String} swapKey - Property of baseArr[idx] containing data to be swapped (ex 'players'/'wins')
 * @param {String} [idxKey='idx'] - Property of baseArr[idx] containing index to be swapped (ex 'idx')
 * @param {Number} [idxA=0] - Index of first Object in baseArr to use (Auto-determine second object as odd-even pair, def: 0)
 */
exports.swapArrays = (baseArr, swapKey, idxKey = 'idx', idxA = 0) => {
  const idxB = exports.getOtherIdx(idxA);
  [ 
    baseArr[idxA][swapKey][baseArr[idxA][idxKey]],
    baseArr[idxB][swapKey][baseArr[idxB][idxKey]],
  ] = [
    baseArr[idxB][swapKey][baseArr[idxB][idxKey]] || 0,
    baseArr[idxA][swapKey][baseArr[idxA][idxKey]] || 0,
  ]
}


/**
 * Moves item in fromArr[moveKey][fromArr[idxKey]] to end of toArr[moveKey]
 * @param {Object} fromArr - Object w/ array to move from (ex matchData[from])
 * @param {Object} toArr - Object w/ array to move to (ex matchData[to])
 * @param {String} [moveKey='drops'] - Key of Array in objects (Same key for from/toArr, ex 'drops')
 * @param {String} [idxKey='dropIdx'] - Key of Index of entry to move in fromArr[moveKey] (ex 'dropIdx')
 * @returns {Number} 1 on success (Result of push operation w/ single arg)
 */
 exports.moveArrays = (fromArr, toArr, moveKey = 'drops', idxKey = 'dropIdx') =>
  toArr[moveKey].push(fromArr[moveKey].splice(fromArr[idxKey],1)[0])