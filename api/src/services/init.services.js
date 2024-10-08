// Imports
const logger = require('../utils/log.adapter');
const exportToClient = require('../config/exportToClient');
const meta = require('../config/meta');
const validation = require('../config/validation');
const { types } = require("pg");

// To be run when server starts
async function initServices(syncOnly = false) {
  // Copy validation params to client
  await exportToClient({ ...validation, meta }, 'src', 'assets', 'validation.json')
    .then(p => console.log('Validate config copied to client --  '+p));
  if (syncOnly) process.exit(0)

  // Setup integer parsing for pg
  types.setTypeParser(types.builtins.INT2, parseInt);
  types.setTypeParser(types.builtins.INT4, parseInt);
  types.setTypeParser(types.builtins.INT8, BigInt);
  // types.setTypeParser(types.builtins.FLOAT4, parseFloat);
  // types.setTypeParser(types.builtins.FLOAT8, parseFloat);
  types.setTypeParser(types.builtins.NUMERIC, parseFloat);

  require('../db/admin/connect'); // Ensure that DB has been loaded
  logger.log('Background services started.');
}

module.exports = initServices;