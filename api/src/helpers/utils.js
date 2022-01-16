// Utility functions
const logger = console;

// Throw err from ERR object (Move to UTILS)
exports.throwErr = (err, msg) => {
    throw new Error(`${msg || "ERROR"}: ${err.message || err.msg || err.code || err.errno || err}`);
};

// Generate a function for 'filter' or 'find(Index)'
// Will match if value is at index or nested w/in index
const includesVal = val => entry => Array.isArray(entry) ? entry.some(includesVal(val)) : entry === val;
exports.includesVal = includesVal;

// Un-flatten an array, grouping every <elemSize> entries
exports.unflat = (array, elemSize) => {
    let newArr = [];
    for(let i=0; i < array.length; i += elemSize) {
        newArr.push(array.slice(i, i + elemSize));
    }
    return newArr;
}

// Sort array by 'ID' field (For ordering unordered data)
exports.sortById = (a,b) => a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);

// Splice command that doesn't modify in place
exports.splicing = (arr, index, count = 1) => arr.slice(0,index).concat(arr.slice(index + count));

// Splice item into array in order
exports.insertInOrder = (arr, val, { asc = true, transform = null, key = null } = {}) => {
  const testVal = transform ? transform(val) : key ? val[key] : val;
  for (let i = arr.length, t; i--; ) {
      t = transform ? transform(arr[i]) : key ? arr[i][key] : arr[i];
      if (asc ? testVal > t : testVal < t) { arr.splice(i+1,0,val); return arr; }
  }
  arr.unshift(val);
  return arr;
};

// Check if any elements are common to both arrays
exports.anyElements = (arrA, arrB) => arrA.some(elem => arrB.includes(elem));

// Concat arrays, ignoring equal values
exports.concatUnique = (arrA, arrB) => {
  arrB.forEach(e => arrA.includes(e) || arrA.push(e));
  return arrA
}

// Map array of objects into object (key field must be unique)
exports.mapObjArr = (objArr, keyName, valName=null) => 
  objArr.reduce((res,next) => {
    if (next[keyName]) {
      res[next[keyName]] = valName ?
      next[valName] :
      { ...next };
      if (!valName) delete res[next[keyName]][keyName];
    }
    return res;
  },{});


exports.arrToObj = (key, rmvKey = true) => obj => Array.isArray(obj) ? obj.reduce((o,e) => {
  if (e[key] && !o[e[key]]) o[e[key]] = e;
  else if (e[key]) logger.error('Entry has duplicate key:',key,e[key],e);
  else logger.error('Entry is missing key:',key,e);
  if (rmvKey) delete e[key];
  return o;
}, {}) : obj ? exports.arrToObj(key,rmvKey)([obj]) : obj;

exports.staticValObj = (keys, value) => keys.reduce((obj, key) => Object.assign(obj, { [key]: value }), {});

  
// Replace function
// function(baseString, { replace: with, ... }) => return resultString;
// Options: { pre: "replacePrefix", suff: "replaceSuffix", notAll: t/f, caseI: t/f }
exports.replaceFromObj = (str, obj, {pre, suff, notAll, caseI, esc}={}) => Object.keys(obj).reduce(
    (curr,next) => curr.replace(
      RegExp(
        (pre || '') + next + (suff || ''),
        (notAll ? '' : 'g') + (caseI ? 'i' : '')
      ),
      esc ? escape(obj[next]) : obj[next]
    ),
    str
);

// Custom array validator
exports.validateArray = (lenLimit, innerCheck) =>
  (arr, evObj) => Array.isArray(arr) &&
    (!lenLimit || typeof lenLimit.min !== 'number' || arr.length >= lenLimit.min) &&
    (!lenLimit || typeof lenLimit.max !== 'number' || arr.length <= lenLimit.max) &&
    (typeof innerCheck !== 'function' || arr.every(e => innerCheck(e, evObj)));

// Custom array sanitizer (Runs innerSanit() then escapes)
const validatorEscape = require('validator').default.escape;
exports.sanitizeArray = (innerSanit, escaped = true) =>
  (arr, evObj) => arr.map(entry => 
    escaped ? validatorEscape(
      typeof innerSanit === 'function' ?
      innerSanit(entry, evObj) : entry
    ) : entry
  );