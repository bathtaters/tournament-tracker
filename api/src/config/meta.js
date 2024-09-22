// Load project metadata

const join = require('path').join;
const pkg = require('../../package.json');

module.exports = {
  name: pkg.name || 'Untitled',
  version: pkg.version || '0',
  port: process.env.PORT || +pkg.config.port || 9090,
  apiVersion: (pkg.version || '1').split('.',1)[0],
  rootPath: join(__dirname,'..','..'), // Update if this file moves
  sqlFilesPath: join(__dirname,'..','db','sql'), // Update if this file moves
  morganLog: 'common', // morgan log format or 'debug' for custom logging
  env: process.env.NODE_ENV,
  pairingThreshold: 10, // Max number of players to use advanced pairing algorithm for
}