const { join } = require('path')
const { runOperation } = require('../db/admin/connect')

// Reset DB paths
const sqlFolder = require('../config/meta').sqlFilesPath;
const dbResetFile = join(sqlFolder, 'resetDb.sql');
const dbTestFile = join(sqlFolder, 'dbtest.sql');

// Test that DB works
exports.testDatabase = () =>
  runOperation((cl) => cl.query("SHOW TABLES;"))
    .then(t => t?.rows?.length)
    .catch(e => { throw e; });

// Reset DB - import 'execFiles' on-demand
exports.resetDatabase = async (fullReset = true, testReset = false) => {
  const { execFiles } = require('../db/admin/directOps')

  if (fullReset) { // Rebuild database
    await execFiles([dbResetFile]);
    const test = await exports.testDatabase();
    if (!test) throw new Error('ResetDB did not work! Check resetDb.sql file.');

  } if (testReset) { // Erase & re-add test data
    await execFiles([dbTestFile]);
  }
  return (fullReset << 1) + testReset
}

