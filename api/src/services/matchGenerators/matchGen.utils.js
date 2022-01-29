// --- SHARED UTILITES FOR GENERATING MATCHES --- \\

/**
 * Copy array except for deleted elements (Similar to splice command).
 * Doesn't modify input array & returns resulting array
 * @param {Any[]} array - Input array
 * @param {Number} index - Index to start removing elements
 * @param {Number} count - Number of elements to remove
 * @returns {Any[]} Spliced copy of array
 */
exports.splicing = (array, start, delCount = 1) => 
  array.slice(0,start).concat(array.slice(start + delCount));

/**
 * Check if any elements are common to both arrays
 * @param {Any[]} arrA - Array
 * @param {Any[]} arrB - Array
 * @returns {Boolean} True if any element in 'arrA' exists in 'arrB'
 */
exports.anyElements = (arrA, arrB) => arrA.some(elem => arrB.includes(elem));


/**
 * "Un-flatten" array
 * Create 2-D array, grouping every 'elemSize' elements
 * @param {Any[]} array - Input array
 * @param {Number} elemSize - Size of innerArrays in result
 * @returns {Any[][]} 2-D result array
 */
exports.unflat = (array, elemSize) => {
  if (elemSize < 1) return array.slice();
  let newArr = [];
  for(let i=0; i < array.length; i += elemSize) {
    newArr.push(array.slice(i, i + elemSize));
  }
  return newArr;
}


/**
 * Check if element is a valid replacement
 * @callback isReplaceCb
 * @param {*} element - Element to test
 * @param {Any[]} innerArray - Inner array containing element
 * @param {Number} innerIndex - Element's index in innerArray
 * @returns {Boolean} Truthy if element is valid replacement
 */
/**
 * Reverse-search 2D Array for a replacement
 * (loops around when it reaches the start of the array)
 * @param {Any[][]} arr2d - 2-D Array of elements to search
 * @param {Number} startIdx - Outer-index to begin backwards search
 * @param {isReplaceCb} isReplace - Function that checks if element is a valid replacement
 * @returns {Number[]} Array containing [outer, inner] index of replacement (or void if no replacement)
 */
exports.revReplace2dIndex = (arr2d, startIdx, isReplace) => {
  const start = (startIdx || arr2d.length) - 1; // ignores itself
  const end = startIdx % arr2d.length; // ensure end is in arr2d
  
  for (let i = start; i !== end; i = (i || arr2d.length) - 1) {
    for (let j = arr2d[i].length; j-- > 0; ) {
      if (isReplace(arr2d[i][j], arr2d[i], j)) return [i,j];
    }
  }
};