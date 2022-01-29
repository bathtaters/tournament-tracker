// Imports
const logger = require('../utils/log.adapter');
const exportToClient = require('../config/exportToClient');
const validation = require('../config/validation');
const { types } = require("pg");
const db = require('../db/admin/connect');

// To be run when server starts
async function initServices() {
  // Copy validation params to client
  exportToClient(validation, 'src', 'assets', 'validation.json')
    .then(p => console.log('Validate config copied to client --  '+p));

  // Setup integer parsing for pg
  types.setTypeParser(types.builtins.INT2, parseInt);
  types.setTypeParser(types.builtins.INT4, parseInt);
  types.setTypeParser(types.builtins.INT8, BigInt);
  // types.setTypeParser(types.builtins.FLOAT4, parseFloat);
  // types.setTypeParser(types.builtins.FLOAT8, parseFloat);
  types.setTypeParser(types.builtins.NUMERIC, parseFloat);

  await db.openConnection(); // Connect to DB
  logger.log('Background services started.');
}

module.exports = initServices;