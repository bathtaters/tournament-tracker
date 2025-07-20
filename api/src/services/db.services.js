const { join } = require("path");

// Reset DB paths
const sqlFolder = require("../config/meta").sqlFilesPath;
const dbResetFile = join(sqlFolder, "resetDb.sql");
const dbTestFile = join(sqlFolder, "dbtest.sql");

// Test that DB works (Inject runOp to test on startup)
exports.testDatabase = (
  runOperationInject = require("../db/admin/connect").runOperation
) =>
  runOperationInject((cl) => cl.query("SHOW TABLES;"))
    .then((t) => t?.rows?.length)
    .catch((e) => {
      throw e;
    });

// Reset DB - import 'execFiles' on-demand, Inject runOp to test on startup
exports.resetDatabase = async (
  fullReset = false,
  testReset = false,
  runOperationInject = require("../db/admin/connect").runOperation
) => {
  const { execFiles } = require("../db/admin/directOps");

  if (fullReset) {
    // Rebuild database
    await execFiles([dbResetFile]);
    const test = await exports.testDatabase(runOperationInject);
    if (!test) throw new Error("ResetDB did not work! Check resetDb.sql file.");
  }
  if (testReset) {
    // Erase & re-add test data
    await execFiles([dbTestFile]);
  }
  return (fullReset << 1) + testReset;
};
