/** Calculate count of all possible combinations of array items in slotCount slots */
const combinationCount = (arrayLen, slotCount) => fact(arrayLen) / (fact(slotCount) * fact(arrayLen - slotCount))

/** Get all possible combinations of array items in slotCount slots (No empties, order doesn't matter) */
function* getCombinations(array, slotCount) {
    
    function* generate(current, start) {
        if (current.length === slotCount) {
            yield [...current]
            return
        }
    
        for (let i = start; i < array.length; i++) {
            current.push(array[i])
            yield* generate(current, i + 1)
            current.pop()
        }
    }
    yield* generate([], 0)
}

/** Calculate count of all possible non-repetative combinations of items in slotCount slots, allowing empty slots */
function permutationCount(arrayLength, slotCount, includeBlanks) {
    // Simple permutation formula
    if (!includeBlanks) return fact(arrayLength) / fact(arrayLength - slotCount)

    // Flip array & slots order to prevent negative factorials
    // The variables are interchangable when including blanks
    if (arrayLength < slotCount) return permutationCount(slotCount, arrayLength, includeBlanks)

    let sum = 0
    for (let n = 0; n < slotCount; n++) {
        // For each possibility of empty slots (none to all but one)
        // Calculate the permutations of the occupied slots x the combinations of empty slots
        sum += permutationCount(arrayLength, slotCount - n, false) * combinationCount(slotCount, n)
    }
    return sum
}

/** Get all non-repeating permutations from array of size slotCount (order matters)
 *  includeBlanks will return permutations containing one or more empty slots
 * -- FIX THIS FOR NUMBERS > 8! -- Make iterative? */
function* getPermutations(array, slotCount, includeBlanks) {

    function* generate(current, remaining) {
        if (current.length === slotCount) {
            yield current.map((i) => array[i])
            return
        }
  
        for (let i = 0; i < remaining.length + +includeBlanks; i++) {
            const next = current.concat(remaining[i])
            yield* generate(next, popIdx(remaining, i))
        }
    }
    yield* generate([], array.map((_,i) => i))
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



// TESTS !!
// const a = ['a','b','c','d','e','f','g','h','i','j','k','l','m'], k = 8, b = false
// const a = ['a','b','c','d','e'], k = 4, b = false
// console.log(a.length,k,[...getCombinations(a,k)].length, combinationCount(a.length,k))
// console.log([...getCombinations(a,k,b)])
// console.log(a.length,k,b,[...getPermutations(a,k,b)].length - +b, permutationCount(a.length,k,b))
// console.log([...getPermutations(a,k,b)])


// HELPERS \\

/** Remove element at idx from array, without mutating */
const popIdx = (arr, idx) => [ ...arr.slice(0, idx), ...arr.slice(idx + 1) ]

/** Calculate the factorial of N (non-recursive) */
const fact = (n) => {
    let i, f
    for (f = i = 1; i <= n; i++) f *= i
    return f
}

// EXPORTS \\
module.exports = {
    combinationCount, getCombinations,
    permutationCount, getPermutations,
    getObjectCombos,
}