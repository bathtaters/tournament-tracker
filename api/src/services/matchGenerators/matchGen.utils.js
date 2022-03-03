// --- SHARED UTILITES FOR GENERATING MATCHES --- \\
const { randomInt } = require('crypto');

// Basic math
exports.count = (item, array) => array ? array.filter(elem => elem === item).length : 0
exports.sum = (array) => array.reduce((tot,n) => tot + n, 0)
exports.avg = (array) => array.length ? exports.sum(array) / array.length : 0
exports.diff = (a,b) => a > b ? a - b : b - a

// Test equality in array
exports.deepEqual = (a,b) => !Array.isArray(a) || !Array.isArray(b) ? a === b :
  a.length === b.length && a.every((ai,i) => exports.deepEqual(ai, b[i]))

// Swap out keys in dict for values (Runs recursively on arrays)
exports.deepSwap = (input, dict) => Array.isArray(input) ?
  input.map(i => exports.deepSwap(i, dict)) : input in dict ? dict[input] : input

// Remove duplicate elements from a sorted array (Using deepEqual)
exports.removeDupes = (sortedArray) => sortedArray.reduce(
  (res,elem) => (exports.deepEqual(elem, res[res.length - 1]) || res.push(elem)) && res
, [])



// Generate all unique combinations of given width from array
exports.getCombos = (array, width = 2) => {

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



// Generate all unique groups of given width from array
exports.getGroups = (array, width) => {

  function recurGroups(remaining, current) {
    if (remaining.length < 1) return [current.sort()]
  
    let result = []
    for (const match of exports.getCombos(remaining, Math.min(remaining.length, width))) {

      recurGroups(remaining.filter(elem => !match.includes(elem)), current.concat([match]))
        .forEach(r => result.push(r))
    }
  
    return result.sort()
  }

  const indexGroups = exports.removeDupes(recurGroups(array.map((_,i) => i), []))
  return exports.deepSwap(indexGroups, array)
}



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
 * @param {Number} elemSize - Size of innerArrays in result
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