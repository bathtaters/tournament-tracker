// Imports
const { Pool } = require("pg");
const parse = require("pg-connection-string").parse;

const { getConnStr, retryBlock } = require('../../utils/dbConnect.utils');
const { testDatabase, resetDatabase } = require('../../services/db.services');
const logger = require('../../utils/log.adapter');

// Default Settings
const retryAttempts = 15;
const retryPauseMs = 1000;

// Connect to the DB
let staticPool;
async function openConnection(asUser = 'api', cfg = null) {
  if (staticPool) { await closeConnection(); }
  const connStr = getConnStr(asUser, cfg); // Build URI

  try {
    staticPool = new Pool(parse(connStr));
    await testDatabase().then(test => { if (!test) throw { code: '3D000' } });
  }
  catch(e) {
    // Catch missing DB
    if ((e.code === '42602' || e.code === '3D000')) {
      console.error('DB Does Not Exist! Creating now...');
      try { await resetDatabase(); } catch (err) { throw err; }
    }
    throw new Error(`Unable to connect to DB: "${connStr}": ${e.message || e.description || e}`);
  }
  return logger.info('Connected to DB server.');
}

// Disconnect from DB
async function closeConnection() {
  if (!staticPool) { throw new Error("Attempting to close connection before opening."); }
  await staticPool.end();
  staticPool = undefined;
  return logger.info('Disconnected from DB server.');
}

//--- Wrapper for SQL Operations ---//
// This gets a client from pool & re-calls operation(client)
// for up to <maxAttempts> (starting @ <retryCount> w/ delay = 2^<retryCount> secs)
async function runOperation(operation = client => {}, maxAttempts = retryAttempts, retryCount = 0, usingPool = null) {
  const pool = usingPool || staticPool;
  if (!pool) throw new Error("Attempting DB access before successfully opening connection.");
  
  let client = await retryBlock(
    pool => pool.connect(), [pool], 5,
    0, null, null, retryPauseMs
  );
  if (!client) throw new Error("Unable to connect to DB.");

  await client.query("BEGIN;");
  try {
    const res = await retryBlock(
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
      },
      // Wait 1s+ between attempts
      retryPauseMs
    );

    // Cleanup
    client.release();
    return res;
  
  // Handle error
  } catch(e) {
    try { await client.query("ROLLBACK;"); }
    catch(rollerr) { logger.error('Failed rollback attempt due to', rollerr); }
    client.release();
    logger.warn("Attempted rollback & released client due to error. CODE:", e.code);
    throw e;
  }
}

module.exports = { openConnection, closeConnection, runOperation, resetDatabase, isConnected: () => !!staticPool }