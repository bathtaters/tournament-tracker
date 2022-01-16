const { Pool } = require("pg");
const parse = require("pg-connection-string").parse;

const getConnStr = require('./getConnStr');
const utils = require('../../helpers/sqlUtils');
const logger = console;

// Connect to the DB
let staticPool;
/* istanbul ignore next */
async function openConnection(asUser = 'api', cfg = null) {
  if (staticPool) { await closeConnection(); }
  const connStr = getConnStr(asUser, cfg); // Build URI

  try { staticPool = new Pool(parse(connStr)); }
  catch(e) { 
    throw new Error(`Unable to connect to DB: ${connStr}: ${e.message || e.description || e}`);
  }
  return;
}

// Disconnect from DB
/* istanbul ignore next */
async function closeConnection() {
  if (!staticPool) { throw new Error("Attempting to close connection before opening."); }
  await staticPool.end();
  staticPool = undefined;
}

//--- Wrapper for SQL Operations ---//
// This gets a client from pool & re-calls operation(client)
// for up to <maxAttempts> (starting @ <retryCount> w/ delay = 2^<retryCount> secs)
async function runOperation(operation, maxAttempts, retryCount, usingPool = null) {
  const pool = usingPool || staticPool;
  if (!pool) throw new Error("Attempting DB access before successfully opening connection.");
  
  let client = await utils.retryBlock(
    pool => pool.connect(), [pool], 5
  );
  if (!client) throw new Error("Unable to connect to DB.");

  await client.query("BEGIN;");
  try {
    const res = await utils.retryBlock(
      // Operation
      async (client,operation) => {
        const res = await operation(client);
        await client.query("COMMIT;");
        return res;
      },

      // Params
      [client,operation], //new Error().stack,
      maxAttempts, retryCount, ["40001"],
      
      // On retry
      async (e, client) => {
        await client.query("ROLLBACK;BEGIN;")
          .then(() => logger.warn("Rolling back & retrying due to: "+(e.message || e.name || e || 'error')));
      }
    );

    // Cleanup
    client.release();
    return res;
  
  // Handle error
  } catch(e) {
    try { await client.query("ROLLBACK;"); }
    catch(rollerr) { logger.error('Failed rollback attempt due to', rollerr); }
    client.release();
    logger.warn("Attempted rollback & released client due to error.");
    throw e;
  }
}

// Public functions
module.exports = { openConnection, closeConnection, runOperation, isConnected: () => !!staticPool }

// Setup integer parsing
utils.initNumberParsing();