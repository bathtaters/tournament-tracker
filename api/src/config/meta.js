// Load project metadata

const join = require('path').join;
const package = require('../../package.json');

module.exports = {
  name: package.name || 'Untitled',
  version: package.version || '0',
  port: process.env.PORT || +package.config.port || 9090,
  apiVersion: (package.version || '1').split('.',1)[0],
  rootPath: join(__dirname,'..','..'), // Update if this file moves
  sqlFilesPath: join(__dirname,'..','db','sql'), // Update if this file moves
}