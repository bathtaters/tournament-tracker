const logger = require('../utils/log.adapter');
const db = require('../db/admin/connect');

async function initServices() {
  initNumberParsing(); // Setup integer parsing
  await db.openConnection(); // Connect to DB
  logger.log('Background services started.');
}

module.exports = initServices;

// Init helper functions //
const { types } = require("pg");

// Setup number parsing for PG module
const initNumberParsing = () => {
  // Setup returning ints/floats as numbers
  types.setTypeParser(types.builtins.INT2, parseInt);
  types.setTypeParser(types.builtins.INT4, parseInt);
  types.setTypeParser(types.builtins.INT8, BigInt);
  // types.setTypeParser(types.builtins.FLOAT4, parseFloat);
  // types.setTypeParser(types.builtins.FLOAT8, parseFloat);
  types.setTypeParser(types.builtins.NUMERIC, parseFloat);
}