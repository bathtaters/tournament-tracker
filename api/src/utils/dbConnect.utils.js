//--- Get URI to connect to DB ---//

// Environment variables to substitute (Uses $ prefix)
const envVars = { "HOME": process.env.HOME || "", "env:appdata": process.env.APPDATA || "" };

// Import
const serverCfg = require('../config/dbServer.json');
const logger = console;

// Get DB connection string //

exports.getConnStr = (dbUser, config = null) => {
  // Get server config data
  if (!config) config = serverCfg;
  if (!config || !config.connectionString)
    throw new Error('Server config is invalid');

  // Get user-specific info
  const userObj = dbUser ? config.users && config.users.find(
    user => user.name.toLowerCase() === dbUser.toLowerCase()
  ) : {};
  if (!userObj) throw new Error("No credentials for " + dbUser);

  // Get base-URI
  let connStr = config.connectionString;
  
  // Insert server/user info into base-URI
  if (config.server)
    connStr = exports.replaceFromObj(connStr, config.server, {pre:'%',caseI:1});
  connStr = exports.replaceFromObj(connStr, userObj, {pre:'%',caseI:1,esc:1});
  
  // Expand environment variables
  connStr = exports.replaceFromObj(connStr, envVars, {pre:'\\$'});
  return connStr;
};


// Retry Block //

exports.retryBlock = async (
  func, args, max, n = 0,
  retryCodes = null, retryCb = null,
  delayMultiplierMs = 10 // 10 x 2^(retry attempt)
) => { 
  // Runs func multiple times until it is successful or reaches 'max'
  while (true) {
    if (n++ >= max) { throw new Error("Max retries reached"); }
    try { const res = await func(...(args || [])); return res; }
    catch (err) {
      if (Array.isArray(retryCodes) && !retryCodes.includes(err.code)) {
        err.stack = extendStackTrace(err.stack, (new Error()).stack);
        throw err;
      }
      else {
        // Retry operation
        if (typeof retryCb === 'function') { await retryCb(err, ...args); }
        else { logger.warn("Attempt failed:", err.message, "Retrying..."); }
        // Pause for increasingly more time between each attempt
        await new Promise((r) => setTimeout(r, 2 ** (n-1) * delayMultiplierMs));
      }
    }
  }
};



// -- Helper Functions -- //

// Extend stack trace to before pg module
const extendStackTrace = (stack, prevStack) => prevStack ? (stack || '') +
  '\n\t--- pre-pg ---\n'+ prevStack.substring(prevStack.indexOf('\n')+1) : stack;

// Replace using { replace: with } object 
// function(baseString, { replace: with, ... }) => return resultString;
// Options: { pre: "replacePrefix", suff: "replaceSuffix", notAll? gFlag, caseI? iFlag, esc? escapes obj.values }
exports.replaceFromObj = (str, obj, {pre, suff, notAll, caseI, esc}={}) => Object.keys(obj || {}).reduce(
  (curr,next) => curr.replace(
    RegExp(
      (pre || '') + next + (suff || ''),
      (notAll ? '' : 'g') + (caseI ? 'i' : '')
    ),
    esc ? escape(obj[next]) : obj[next]
  ),
  str
);