
// Splice command, doesn't modify input arr & returns arr
exports.splicing = (arr, index, count = 1) => arr.slice(0,index).concat(arr.slice(index + count));

// Check if any elements are common to both arrays
exports.anyElements = (arrA, arrB) => arrA.some(elem => arrB.includes(elem));


// "Un-flatten" array, group every <elemSize> entries
exports.unflat = (array, elemSize) => {
  if (elemSize < 1) return array.slice();
  let newArr = [];
  for(let i=0; i < array.length; i += elemSize) {
    newArr.push(array.slice(i, i + elemSize));
  }
  return newArr;
}


// Reverse-search 2D Array for a replacement
// (loops around when it reaches the start of the array)
// Callback: (value, inner array, inner array idx) => true/false
exports.revReplace2dIndex = (arr2d, startIdx, isReplace = () => {}) => {
  const start = (startIdx || arr2d.length) - 1; // ignores itself
  const end = startIdx % arr2d.length; // ensure end is in arr2d
  
  for (let i = start; i !== end; i = (i || arr2d.length) - 1) {
    for (let j = arr2d[i].length; j-- > 0; ) {
      if (isReplace(arr2d[i][j], arr2d[i], j)) return [i,j];
    }
  }
};