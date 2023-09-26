/** Calculate count of all possible combinations of array items in slotCount slots */
const combinationCount = (arrayLen, slotCount) => slotCount && fact(arrayLen) / (fact(slotCount) * fact(arrayLen - slotCount))

/** Get the Nth combination of array items in slotCount slots
 *   No empties, order doesn't matter, comboCount = result of combinationCount() */
function getCombinationN(n, array, slotCount, comboCount) {
    let combo = [], len = array.length

    for (let curIndex = comboCount; slotCount > 0; slotCount--) {
        comboCount = Math.trunc((comboCount * slotCount) / len)

        while (curIndex > n + comboCount) {
            curIndex -= comboCount
            comboCount *= len - slotCount
            comboCount = Math.trunc((comboCount - (comboCount % slotCount)) / --len)
        }
        combo.push(array[--len])
    }
    return combo
}


/** Calculate count of all possible non-repetative combinations of items in slotCount slots, allowing empty slots */
function permutationCount(arrayLength, slotCount, includeBlanks) {
    // Simple permutation formula
    if (!includeBlanks) return slotCount > arrayLength ? 0 : fact(arrayLength) / fact(arrayLength - slotCount)

    // Flip array & slots order to prevent negative factorials
    // The variables are interchangable when including blanks
    if (arrayLength < slotCount) return permutationCount(slotCount, arrayLength, includeBlanks)

    let sum = 1
    for (let n = 0; n < slotCount; n++) {
        // For each possibility of empty slots (none to all but one)
        // Calculate the permutations of the occupied slots x the combinations of empty slots
        sum += permutationCount(arrayLength, slotCount - n, false) * combinationCount(slotCount, n)
    }
    return sum
}

/** Get all non-repeating permutations from array of size slotCount (order matters)
 *  includeBlanks will return permutations containing one or more empty slots */
function* getPermutations(array, slotCount, includeBlanks = false) {
    const maxIdx = array.length - +!includeBlanks,
        lastSlot = slotCount - 1
    let indexes = Array.from({ length: slotCount }, (_, idx) => idx < array.length ? idx : maxIdx)

    for (let ptr = lastSlot; ptr >= 0; indexes[ptr]++) {
        if (!hasRepeats(indexes, includeBlanks && maxIdx))
            yield indexes.map((i) => array[i])
    
        ptr = lastSlot
        while (indexes[ptr] === maxIdx)
            indexes[ptr--] = 0
    }
}

/** Calculate all possible combinations of a multi-dimensional array
 *   from an array of the inner array sizes, returning an array of indexes for each call.
 *    - This will always return a reference to the same, mutating array
 *    - Ex: ([3,5,2]) => [0,0,0]; [0,0,1]; [0,1,0]; [0,1,1]; etc. */
function* getArrayCombos(arrayOfIdxs) {
    let next = arrayOfIdxs.map((val) => val ? 0 : null)

    // Trim 'null' values off the end of array
    let maxIdx = next.length - 1
    while (next[maxIdx] == null && maxIdx) maxIdx--

    let ptr = maxIdx
    while (true) {
        yield next

        ptr = maxIdx
        while (next[ptr] == null || next[ptr] + 1 >= arrayOfIdxs[ptr]) {
            next[ptr] = next[ptr] && 0
            ptr--
            if (ptr < 0) return
        }
        next[ptr]++
    }
}


// HELPERS \\

/** Calculate the factorial of N (non-recursive) */
function fact(n) {
    let i, f
    for (f = i = 1; i <= n; i++) f *= i
    return f
}

/** Return true if array has any repeating values,
 * unless the repeated value is ignoreValue */
function hasRepeats(array, ignoreValue) {
    return array.some((val,idx) => {
        if (val === ignoreValue) return false

        for (let i = idx + 1; i < array.length; i++) {
            if (val === array[i]) return true
        }
        return false
    })
}


// EXPORTS \\
module.exports = {
    combinationCount, getCombinationN,
    permutationCount, getPermutations,
    getArrayCombos,
}