//--- Get URI to connect to DB ---//

// Environment variables to substitute (Uses $ prefix)
/* istanbul ignore next */
const envVars = { "HOME": process.env.HOME || "", "env:appdata": process.env.APPDATA || "" };

// Import
const utils = require('./utils');
const serverCfg = require('../config/dbServer.json');

// Convert credentials to connectionString
module.exports = (dbUser, config = null) => {
  // Get server config data
  if (!config) config = serverCfg;
  if (!config || !config.connectionString)
    throw new Error('Server config is invalid');

  // Get user-specific info
  const userObj = dbUser ? config.users && config.users.find(
    user => user.name.toLowerCase() === dbUser.toLowerCase()
  ) : {};
  if (!userObj) throw new Error("No credentials for " + dbUser);

  // Get base-URI
  let connStr = config.connectionString;
  
  // Insert server/user info into base-URI
  if (config.server)
    connStr = utils.replaceFromObj(connStr, config.server, {pre:'%',caseI:1});
  connStr = utils.replaceFromObj(connStr, userObj, {pre:'%',caseI:1,esc:1});
  
  // Expand environment variables
  connStr = utils.replaceFromObj(connStr, envVars, {pre:'\\$'});
  return connStr;
};