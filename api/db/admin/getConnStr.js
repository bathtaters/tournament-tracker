//--- Get URI to connect to DB ---//

/* SAMPLE dbServerCfg.json
// NOTE: This file should placed in this directory w/ below data
// Connection string will substitute %<VAR> for users[n].<var> or server.<var>
// It will also substitute $<envVars> based on envVars (below)
{
  "connectionString": "%PROTO://%NAME:%PASS@%DOM:%PORT/%DB?sslmode=%MODE&sslrootcert=%CERT&options=%OPTS",
  "users": [
    { "name": "dbUser", "pass": "password123" },
    { "name": "api",    "pass": "password456" },
  ],
  "server": {
    "proto": "postgresql",
    "dom": "free-tier.gcp-us-central1.cockroachlabs.cloud",
    "port": "26257",
    "db": "defaultdb",
    "mode": "verify-full",
    "cert": "$HOME/.postgresql/root.crt",
    "opts": ""
  }
}
//*/

// Environment variables to substitute (Uses $ prefix)
/* istanbul ignore next */
const envVars = { "HOME": process.env.HOME || "", "env:appdata": process.env.APPDATA || "" };

// Import
const utils = require('../../services/utils');
const serverCfg = require('./dbServerCfg.json'); // Config data

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