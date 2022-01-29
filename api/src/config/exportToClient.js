// Import
const join = require('path').join;
const fs = require('fs/promises');

// Root path of client project
const clientBase = join(require('./meta').rootPath,'..','client')

// Save JSON of validation to client assets
const exportToClient = (data, ...clientPath) => {
  const path = join(clientBase, ...clientPath)
  return fs.writeFile(path, JSON.stringify(data)).then(() => path)
}

module.exports = exportToClient