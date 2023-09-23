/** Calculate count of all possible combinations of array items in slotCount slots */
const combinationCount = (arrayLen, slotCount) => fact(arrayLen) / (fact(slotCount) * fact(arrayLen - slotCount))

/** Get all possible combinations of array items in slotCount slots (No empties, order doesn't matter) */
function* getCombinations(array, slotCount) {
    const unused = array.length - slotCount
    let indices = Array.from({ length: slotCount }, (_, i) => i)
  
    while (indices[0] <= unused) {
        yield indices.map(i => array[i])
        
        let i = slotCount - 1
        while (indices[i] === i + unused) {
            if (--i < 0) return
        }
  
        indices[i]++
        for (let j = i + 1; j < slotCount; j++) {
            indices[j] = indices[j - 1] + 1
        }
    }
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

/** Calculate all possible combinations of a single element from array prop nested with the objArray
 *  (ie: [{ a: [1,2] }, { a: [3, 4] }] => [{ a: 1 }, { a: 3 }] => [{ a: 1 }, { a: 4 }] => etc) */
function* getObjectCombos(objArray, innerArrayKey) {

    function* combine(current = [], index = 0) {
        if (index === objArray.length) {
            yield current
            return
        }
  
        for (let i = 0; i < objArray[index][innerArrayKey].length; i++) {
            current[index] = { ...objArray[index], [innerArrayKey]: objArray[index][innerArrayKey][i] }
            yield* combine(current, index + 1)
        }
    }
  
    yield* combine()
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
    combinationCount, getCombinations,
    permutationCount, getPermutations,
    getObjectCombos,
}