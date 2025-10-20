// Imports
const logger = require("../utils/log.adapter");
const { types } = require("pg");

// To be run when server starts
async function initServices() {
  // Setup integer parsing for pg
  types.setTypeParser(types.builtins.INT2, parseInt);
  types.setTypeParser(types.builtins.INT4, parseInt);
  types.setTypeParser(types.builtins.INT8, BigInt);
  // types.setTypeParser(types.builtins.FLOAT4, parseFloat);
  // types.setTypeParser(types.builtins.FLOAT8, parseFloat);
  types.setTypeParser(types.builtins.NUMERIC, parseFloat);

  // Ensure that DB has been loaded
  const connect = await import("../db/admin/connect");
  await connect.openConnection();

  // Run DB cleanup tasks
  const { clean } = await import("../db/models/team");
  await clean().then(
    (c) => c && console.log(`Removed ${c} unused teams from the database.`),
  );
  logger.log("Background General started.");
}

module.exports = initServices;
