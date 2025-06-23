// --- SHARED UTILITES FOR GENERATING MATCHES --- \\
const { getCombinations, getUniqueCombinations } = require('../../utils/combination.utils')
const { shuffle } = require('../../utils/shared.utils');


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
 * Return an array of the items in array A that are not in B
 * @param {Any[]} base - Base input array, items should not repeat
 * @param {Any[][]} array - Array to subtract from base, can be multi-dimensional
 * @returns {Any[]} An array containing items in array A that are not in array B.
 */
exports.remaining = (base, array) => {
  let remain = [...base]
  if (!array) return remain

  for (const items of array) {
    for (const item of items) {
      const idx = remain.indexOf(item)
      if (idx >= 0) remain.splice(idx, 1)
    }
  }
  return remain
}



// --- COMBINATION OPS --- \\

/**
 * Generate every unique group of size 'width' from 'array' elements
 * @param {Any[]} array - Input elements
 * @param {Number} width - Max size of each group
 * @returns {Any[][][]} Array of arrays containing each group as an array
 */
exports.getGroups = function* (array, width) {
  // Enforce width limits, avoid inifinte loops
  if (width < 1) width = 1
  else if (width > array.length) width = array.length

  const gamesPerRound = Math.floor(array.length / width)
  const remainder = array.length % width

  // Get all possible player groupings
  const matches = [...getCombinations(array, width)]
  
  for (const round of getUniqueCombinations(matches, gamesPerRound)) {
    if (remainder) round.push(exports.remaining(array, round))
    yield round
  }
}


exports.getGroupsSimple = (array, width) => {
  let result = [], current = []

  for (const entry of array) {
    current.push(entry)

    if (current.length >= width) {
      result.push(current)
      current = []
    }
  }

  if (current.length) result.push(current)
  return result
}


// --- RANDOMIZE/2D-IZE ARRAY --- \\

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