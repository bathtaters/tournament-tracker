
const logger = console;

// Test for SQL injection
exports.strTest = str => {
    if(/\s|;/.test(str))
        throw Error("Possible SQL injection: "+str);
};

// Build placeholders for SQL based on array.length (ie. $1, $2, $3)
exports.queryVars = (array, startNum = 1) => 
    array.filter(e=>e!==undefined)
        .map((_,i)=>`$${startNum+i}`).join(', ');

// Convert single-entry array into element
exports.unnestIfSolo = arr =>  arr && (arr.length || undefined) && 
  (arr.length === 1 ? arr[0] : arr);

// Setup number parsing for PG module
exports.initNumberParsing = () => {
    const { types } = require("pg");
    // Setup returning ints/floats as numbers
    types.setTypeParser(types.builtins.INT2, parseInt);
    types.setTypeParser(types.builtins.INT4, parseInt);
    types.setTypeParser(types.builtins.INT8, BigInt);
    // types.setTypeParser(types.builtins.FLOAT4, parseFloat);
    // types.setTypeParser(types.builtins.FLOAT8, parseFloat);
    types.setTypeParser(types.builtins.NUMERIC, parseFloat);
}

const prependStack = (stack, prevStack) => prevStack ?
  stack +'\n\t--- pre-pg ---\n'+ prevStack.substring(prevStack.indexOf('\n')+1) : stack;
exports.prependStack = prependStack;

// Retry block base
exports.retryBlock = async (func, args, max, n = 0, retryCodes = null, retryCb = null) => { 
  while (true) {
    if (n++ === max) { throw new Error("Max retries reached."); }
    // currStack = prependStack(new Error().stack, stack);
    try { const res = await func(...args); return res; }
    catch (err) {
      if (Array.isArray(retryCodes) && !retryCodes.includes(err.code)) {
        err.stack = prependStack(err.stack, new Error().stack);
        throw err;
      }
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