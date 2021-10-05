// ------  All random-related operations ------ //
const swapArr = (i,j,arr) => {
    if (i != j) [arr[i], arr[j]] = [arr[j], arr[i]];
};


// ----- Algorithm options:
const allAlgorithms = {
  simple: (min,max) => min + Math.floor(Math.random() * (max - min)),
  secure: require('crypto').randomInt
};
// Selected algorithm
const randomAlgo = allAlgorithms.secure;


// ------ Public functions:

// Basic random operations
const int = (maxExcl,minInclu=0) => randomAlgo(minInclu,maxExcl);
const flip = () => !int(2);
const elem = array => array[int(array.length)];

// Shuffles any array using Fisher-Yates
function shuffled(array) {
    array = [...array];
    let i = array.length;
    while (i--) {
      const j = int(i + 1);
      swapArr(i,j,array);
    }
    return array;
}

module.exports = { int, flip, elem, shuffled }