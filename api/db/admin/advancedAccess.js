/* *** ADVANCED SQL UI *** */
const fs = require("fs/promises");
const join = require("path").join;
const db = require('./connect');
const utils = require('../../services/sqlUtils');

// DB Parameters
const resetDbFiles = [ join(__dirname,'resetDb.sql') ];
const attemptsDefault = 15;
const retriesDefault = 0;

// Force init on load
if (!db.isConnected()) db.openConnection();

// Base DB controller
function operation(clientOp = client => null, maxAttempts = attemptsDefault, retryCount = retriesDefault) {
    return db.runOperation(clientOp, maxAttempts, retryCount);
}

// Execute query
function query(text, args = [], splitArgs = null, maxAttempts = attemptsDefault, retryCount = retriesDefault) {
    // Split text/args into arrays
    if (!Array.isArray(text)) text = text.split(';').filter(q=>q.trim());
    text = text.map(q => /;\s*$/.test(q) ? q : q+';');
    
    // logger.debug('QUERIES:',text);
    return operation(
        // client => utils.awaitEach(client.query, text.map((q,i) => [q, splitArgs ? args[i] : args])),
        client => Promise.all(text.map((q,i) => client.query(q, splitArgs ? args[i] : args))),
        maxAttempts, retryCount
    );
}

// Load commands from a .SQL file
async function loadFiles(pathArray) {
    // Read files into array
    let sqlFileText = await Promise.all(pathArray.map(path =>
        fs.readFile(path)
        .then(file => file.toString().split(';'))
        .catch(e => { throw new Error(`Unable to read SQL file '${path}': ${e.message || e.description || e}`) })
    ));
    
    sqlFileText = sqlFileText.flat(1);
  
    // Remove comments and minimize white space
    sqlFileText = sqlFileText.map(l => 
        l.replace(/--[^\n]*(?:\n|$)/g,'').replace(/\s+/g,' ').trim()
    ).filter(Boolean);

    // logger.debug(sqlFileText);
    return sqlFileText;
}

// Load and execute file
const execFiles = (pathArray, maxAttempts = attemptsDefault, retryCount = retriesDefault) => 
    loadFiles(pathArray).then(text => query(text,[],maxAttempts,retryCount));

// Completely erase the database & create a new one
const resetDb = (maxAttempts = attemptsDefault, retryCount = retriesDefault) =>
    execFiles(resetDbFiles, maxAttempts, retryCount);

module.exports = {
    operation, query, execFiles, resetDb,
    init: db.openConnection,
    deinit: db.closeConnection,
    loadFiles
}
