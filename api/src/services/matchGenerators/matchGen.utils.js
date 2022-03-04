// --- SHARED UTILITES FOR GENERATING MATCHES --- \\
const { randomInt } = require('crypto');
const logger = require('../../utils/log.adapter')


// --- BASIC MATH OPS --- \\

/**
 * Count item frequency in array
 * @param {Any} item - Item to count
 * @param {Any[]} array - Array of items
 * @returns {Number} Frequency of 'item' occurances in 'array'
 */
exports.count = (item, array) => array ? array.filter(elem => elem === item).length : 0

/**
 * Sum elements in array
 * @param {Number[]} array - Array of numbers
 * @returns {Number} Sum of array
 */
exports.sum = (array) => array.reduce((tot,n) => tot + n, 0)

/**
 * Average elements in array
 * @param {Number[]} array - Array of numbers
 * @returns {Number} Average of array
 */
exports.avg = (array) => !array.length ? 0 : array.length === 1 ? array[0] : exports.sum(array) / array.length

/**
 * Non-negative difference between 2 numbers
 * @param {Number} a - Operand 1
 * @param {Number} b - Operand 2
 * @returns {Number} Non-negative difference in operands
 */
exports.diff = (a,b) => a > b ? a - b : b - a



// --- ARRAY OPS --- \\

/**
 * Test equality in array
 * Recursively compares equivalent elements using '==='
 * @param {Any[]} a  - Left Array/Element to compare
 * @param {Any[]} b - Right Array/Element to compare
 * @returns {Boolean} True if all adjacent elements in each array are equal
 */
exports.deepEqual = (a,b) => !Array.isArray(a) || !Array.isArray(b) ? a === b :
  a.length === b.length && a.every((ai,i) => exports.deepEqual(ai, b[i]))

/**
 * Swap out keys in dict for values (Runs recursively on arrays)
 * Will leave in place elements not in dict
 * @param {Any[]} input - Array/element to recursively iterate/replace
 * @param {Object} dict - Dictionary { [toRepalce]: replaceWith, ... }
 * @returns {Any[]} 'input' with dict keys swapped for cooresponding values
 */
exports.deepSwap = (input, dict) => Array.isArray(input) ?
  input.map(i => exports.deepSwap(i, dict)) : input in dict ? dict[input] : input

/**
 * Remove duplicate elements from a sorted array (Uses deepEqual)
 * @param {Any[]} sortedArray - Input array (Must be sorted)
 * @returns {Any[]} Copy of input minus dupplicate elements
 */
exports.removeDupes = (sortedArray) => sortedArray.reduce(
  (res,elem) => (exports.deepEqual(elem, res[res.length - 1]) || res.push(elem)) && res
, [])



// --- COMBINATION OPS --- \\

/**
 * Generate every unique combination of size 'width' from 'array' elements
 * @param {Any[]} array - Input elements
 * @param {Number} width - Size of each combination
 * @returns {Any[][]} Array of combination arrays
 */
exports.getCombos = (array, width = 2) => {
  if (!array.length || array.length < width) logger.warn('getCombos array is smaller than width',width,array.length,array)

  function recurCombos(remaining, current) {
    const isFinal = current.length + 1 >= width, len = remaining.length
    
    let result = []
    for (let i = 0; i < len; i++) {

      if (isFinal)
        result.push(current.concat(remaining[i]))

      else
        recurCombos(remaining.slice(i+1), current.concat(remaining[i]))
          .forEach(r => result.push(r))

    }
    return result
  }

  return recurCombos(array, [])
}


/**
 * Generate every unique group of size 'width' from 'array' elements
 * @param {Any[]} array - Input elements
 * @param {Number} width - Max size of each group
 * @returns {Any[][][]} Array of arrays containing each group as an array
 */
exports.getGroups = (array, width) => {

  // Recursively build groups from remaining elements
  function recurGroups(remaining, current) {
    // Break loop when no elements remain
    if (remaining.length < 1) return [current.sort()]
    
    // Iterate through each possible combo
    let result = []
    for (const match of exports.getCombos(remaining, Math.min(remaining.length, width))) {

      // Remove combo elements from 'remaining' & recurse
      recurGroups(remaining.filter(elem => !match.includes(elem)), current.concat([match]))
        .forEach(r => result.push(r)) // Add each result to result array
    }
  
    return result.sort()
  }

  // Run using indexes to improve time on sorting & tie-break based on input order
  const indexGroups = exports.removeDupes(recurGroups(array.map((_,i) => i), []))
  return exports.deepSwap(indexGroups, array)
}



// --- RANDOMIZE/2D-IZE ARRAY --- \\

// Fischer-Yates shuffle algo
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = randomInt(currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/**
 * Randomize & Un-flatten array
 * Create 2-D array, randomly grouping every 'elemSize' elements
 * @param {Any[]} array - Input array
 * @param {Number} groupSize - Size of innerArrays in result
 * @returns {Any[][]} 2-D result array
 */
 exports.randomGroup = (array, groupSize) => {
  array = shuffle(array.slice());
  if (groupSize < 1) return array;
  let newArr = [];
  for(let i=0; i < array.length; i += groupSize) {
    newArr.push(array.slice(i, i + groupSize));
  }
  return newArr;
}