// Utility functions


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

  
// Replace function
// function(baseString, { replace: with, ... }) => return resultString;
// Options: { pre: "replacePrefix", suff: "replaceSuffix", notAll: t/f, caseI: t/f }
exports.replaceFromObj = (str, obj, opts={}) => Object.keys(obj).reduce(
    (curr,next) => curr.replace(
      RegExp(
        (opts.pre || '') + next + (opts.suff || ''),
        (opts.notAll ? '' : 'g') + (opts.caseI ? 'i' : '')
      ),
      opts.esc ? escape(obj[next]) : obj[next]
    ),
    str
);

// Retry block base
exports.retryBlock = async (func, args, max, n = 0, retryCodes = null, retryCb = null) => {
    while (true) {
      if (n++ === max) { throw new Error("Max retries reached."); }
      try { const res = await func(...args); return res; }
      catch (err) {
        if (Array.isArray(retryCodes) && !retryCodes.includes(err.code)) { throw err; }
        else {
          // Retry operation
          logger.log("Attempt failed:", err.message, "Retrying...");
          if (typeof retryCb === 'function') { await retryCb(err, ...args); }
          // Pause for increasingly more time between each attempt
          await new Promise((r) => setTimeout(r, 2 ** n * 1000));
        }
      }
    }
}

// Custom array validator
exports.validateArray = (lenLimit, innerCheck) =>
  (arr, evObj) => Array.isArray(arr) &&
    (!lenLimit || typeof lenLimit.min !== 'number' || arr.length >= lenLimit.min) &&
    (!lenLimit || typeof lenLimit.max !== 'number' || arr.length <= lenLimit.max) &&
    (typeof innerCheck !== 'function' || arr.every(e => innerCheck(e, evObj)));

// Custom array sanitizer (Runs innerSanit() then escapes)
const { escape } = require('validator').default;
exports.sanitizeArray = (innerSanit, escaped = true) =>
  (arr, evObj) => arr.map(entry => 
    escaped ? escape(
      typeof innerSanit === 'function' ?
      innerSanit(entry, evObj) : entry
    ) : entry
  );