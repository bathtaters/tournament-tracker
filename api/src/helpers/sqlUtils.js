
const logger = console;

// Test for SQL injection
exports.strTest = str => {
  if (Array.isArray(str)) return str.forEach(exports.strTest);
  if(typeof str !== 'string') str = str.toString()
  if(/\s|;/.test(str))
    throw new Error("Possible SQL injection: "+str);
};

// Build placeholders for SQL based on array.length (ie. $1, $2, $3)
exports.queryVars = (array, startNum = 1) => 
    array.filter(e=>e!==undefined)
        .map((_,i)=>`$${startNum+i}`).join(', ');

// Process results
exports.getReturn = res => !res ? res : Array.isArray(res) ? res.map(r => r && (r.rows || r)) : res.rows || res;
exports.getFirst = (additQual=true) => res => additQual && Array.isArray(res) && res[0] ? res[0] : res;
exports.getSolo = qry => {
    if ((Array.isArray(qry) && qry.length !== 1)) return r => r;
    if (typeof qry === 'string' && (qry.match(/;|\S\s*$/g) || []).length !== 1) return r => r;
    return r => r && r.length === 1 && r[0] ? r[0] : r;
};

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

// Promise.all that waits before moving on
exports.awaitEach = async (asyncCb, argsArray) => {
  if (typeof asyncCb !== 'function') throw new Error('awaitEach expects function not '+typeof asyncCb);
  let res = [];
  for (const args of argsArray) {
      try {
          await asyncCb(...args).then(r => res.push(r));
      } catch (e) {
          console.error('Error during awaitEach: ',args,e);
          res.push(null);
      }
  }
  if (res.length !== argsArray.length) console.error('awaitEach input/output mismatch:',argsArray,res);
  return res;
};

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