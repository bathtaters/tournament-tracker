const logger = console;
const db = require('../db/admin/connect');
const utils = require('../utils/sqlUtils');

async function initServices() {
  utils.initNumberParsing(); // Setup integer parsing
  await db.openConnection(); // Connect to DB
  logger.log('Background services started.');
}

module.exports = initServices;