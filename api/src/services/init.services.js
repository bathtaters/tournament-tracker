// Imports
const logger = require('../utils/log.adapter');
const { types } = require("pg");

// To be run when server starts
function initServices() {
  // Setup integer parsing for pg
  types.setTypeParser(types.builtins.INT2, parseInt);
  types.setTypeParser(types.builtins.INT4, parseInt);
  types.setTypeParser(types.builtins.INT8, BigInt);
  // types.setTypeParser(types.builtins.FLOAT4, parseFloat);
  // types.setTypeParser(types.builtins.FLOAT8, parseFloat);
  types.setTypeParser(types.builtins.NUMERIC, parseFloat);

  require('../db/admin/connect').openConnection(); // Ensure that DB has been loaded
  logger.log('Background services started.');
}

module.exports = initServices;