// -- Helpers for SwapPlayers -- \\


/**
 * Get index that item will be swapped with (0=1, 1=0, 2=3, 3=2, ...)
 * NOTE: Currently using 'quick mode' which only works with 2 inputs (0 & 1)
 * @param {Number} idx - Index of item
 * @returns {Number} Index of pair to swap with
 */
// exports.getOtherIdx = (idx) => idx + (idx % 2 ? -1 : 1) // (If swapping w/ more than 2 inputs)
exports.getOtherIdx = (idx) => +!idx // QUICK METHOD (For swapping w/ 2 inputs)


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
 * @param {Object[]} dataArr - Object Array containing swap data (ie swapData)
 * @param {Object[]} baseArr – Object Array to use for swap (ie matchData)
 * @param {String} swapKey - Property of baseArr[idx] containing data to be swapped (ex 'players'/'wins')
 * @param {String} baseIdxKey - Property of dataArr[idx] containing index of baseArr (ex 'matchidx')
 * @param {String} swapIdxKey - Property of dataArr[idx] containing index of swapArr (ex 'playeridx')
 * @param {Number} [idxA=0] - Index of first Object in dataArr to use (Auto-determine second object as odd-even pair, def: 0)
 */
exports.swapArrays = (dataArr, baseArr, swapKey, baseIdxKey, swapIdxKey, idxA = 0) => {
  const idxB = exports.getOtherIdx(idxA);
  [ 
    baseArr[dataArr[idxA][baseIdxKey]][swapKey][dataArr[idxA][swapIdxKey]],
    baseArr[dataArr[idxB][baseIdxKey]][swapKey][dataArr[idxB][swapIdxKey]],
  ] = [
    baseArr[dataArr[idxB][baseIdxKey]][swapKey][dataArr[idxB][swapIdxKey]] || 0,
    baseArr[dataArr[idxA][baseIdxKey]][swapKey][dataArr[idxA][swapIdxKey]] || 0,
  ]
}


/**
 * Moves item in fromArr[moveKey][fromArr[idxKey]] to end of toArr[moveKey]
 * @param {Object[]} baseArr - Base array to use for move (ex matchData)
 * @param {Number} from - BaseArr index to move from (ex 0)
 * @param {Number} to - BaseArr index to move to (ex 1)
 * @param {String} moveKey - Key of Array in objects (Same key for from/toArr, ex 'drops')
 * @param {Number} moveIdx - Index of entry to move in baseArr[from][moveKey] (ex 'data.dropIdx')
 * @returns {Number} ToArray size on success (Result of push operation)
 */
 exports.moveArrays = (baseArr, from, to, moveKey, moveIdx) =>
  baseArr[to][moveKey].push(baseArr[from][moveKey].splice(moveIdx,1)[0])