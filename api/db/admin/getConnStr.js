//--- Get URI to connect to DB ---//

const { replaceFromObj } = require('../../services/utils');
const serverCfg = require('./dbServerCfg.json'); // Config data

// Defaults
const defaultCredData = {
    connectionString: "%PROTO://%NAME:%PASS@%DOM:%PORT/%DB?sslmode=%MODE&sslrootcert=%CERT&options=%OPTS",
    envVars: { "HOME": process.env.HOME || "", "env:appdata": process.env.APPDATA || "" },
    server: {
      proto: "postgresql",
      dom: "free-tier.gcp-us-central1.cockroachlabs.cloud",
      port: "26257",
      db: "defaultdb",
      mode: "verify-full",
      cert: "$HOME/.postgresql/root.crt",
      opts: ""
    },
}

// Convert credentials to connectionString
module.exports = (dbUser, credentials = null) => {
    if (!credentials) credentials = serverCfg;
    // Get base-URI
    let connStr = credentials.connectionString || defaultCredData.connectionString;
    
    // Get user-specific info
    const userObj = credentials.users.find(
      user => user.name.toLowerCase() === dbUser.toLowerCase()
    );
    if (!userObj) throw new Error("No credentials for " + dbUser);
    
    // Get server info
    const serverObj = { ...defaultCredData.server, ...credentials.server };
    
    // Insert server/user info into base-URI
    connStr = replaceFromObj(connStr, serverObj, {pre:'%',caseI:1});
    connStr = replaceFromObj(connStr, userObj,   {pre:'%',caseI:1,esc:1});
    
    // Expand environment variables
    connStr = replaceFromObj(connStr, defaultCredData.envVars, {pre:'\\$'});
    return connStr;
}