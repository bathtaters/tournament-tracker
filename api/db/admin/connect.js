const fs = require("fs/promises");
const join = require("path").join;
const { Pool } = require("pg");
const parse = require("pg-connection-string").parse;

const getConnStr = require('./getConnStr');
const { throwErr } = require('../../services/utils');
const utils = require('../../services/sqlUtils');
const logger = console; // Setup logger

// Connect to the DB
let pool;
async function openConnection(asUser = 'api', cfg = null) {
  if (pool) { await closeConnection(); }
  const connStr = getConnStr(asUser, cfg); // Build URI

  try { pool = new Pool(parse(connStr)); }
  catch(err) { throwErr(err, 'Unable to connect to DB: '+connStr); }
  return;
}

// Disconnect from DB
async function closeConnection() {
  if (!pool) { throw new Error("Attempting to close connection before opening."); }
  await pool.end();
  pool = undefined;
}

// Execute commands from a .SQL file
async function runSqlFile(path, maxAttempts, retryCount = 0) {
  const sqlFile = await fs.readFile(path)
    .then(f => f.toString().split(';').map(l=>l.replace(/--[^\n]*(?:\n|$)/g,'').replace(/(?:\n|\r\n)+/g,' ').trim()).filter(l=>!!l))
    .catch(er => throwErr(er, "Unable to read SQL file ("+path+")"));
  // logger.debug(sqlFile);
  return runOperation(async client => {
    let resArr = [];
    for (let cmd of sqlFile) {
      cmd = cmd.trimLeft().replace(/\s+/g,' ') + ';';
      const res = await client.query(cmd);
      res && res.rows && res.rows.length && resArr.push(res.rows);
    }
    return resArr;
  }, maxAttempts, retryCount);
}



//--- Wrapper for SQL Operations ---//
// This gets a client from pool & re-calls operation(client)
// for up to <maxAttempts> (starting @ <retryCount> w/ delay = 2^<retryCount> secs)
async function runOperation(operation, maxAttempts, retryCount = 0) {
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
        await client.query(
          "ROLLBACK;", () => logger.log("Rolling back transaction.")
        );
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
    logger.log("Attempted to rollback transaction & released client due to error.");
    throw e;
  }
}

// Completely erase the database & create a new one
const resetDb = (maxAttempts = 15, retryCount = 0) => runSqlFile(join(__dirname,'resetDb.sql'), maxAttempts, retryCount);

// Public functions
module.exports = { openConnection, closeConnection, runOperation, runSqlFile, resetDb, isConnected: () => !!pool }

// Setup integer parsing
utils.initNumberParsing();