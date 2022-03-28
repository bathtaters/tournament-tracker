/* *** ADVANCED SQL UI *** */
const fs = require("fs/promises");
const db = require('./connect');

// Execute query
function query(text, args = [], splitArgs = null) {
    // console.log('QUERY:',text,args); // uncomment to output every query
    // Split text/args into arrays
    if (!Array.isArray(text)) text = text.split(';').filter(q=>q.trim());
    text = text.map(q => /;\s*$/.test(q) ? q : q+';');
    
    // logger.debug('QUERIES:',text);
    return db.runOperation(
        client => Promise.all(text.map((q,i) => client.query(q, splitArgs ? args[i] : args)))
    );
}

// Load commands from a .SQL file
async function loadFiles(pathArray) {
    // Read files into array
    let sqlFileText = await Promise.all(pathArray.map(path => path &&
        fs.readFile(path)
        .then(file => file.toString().split(';'))
        .catch(e => { throw new Error(`Unable to read SQL file '${path}': ${e.message || e.description || e}`) })
    ));
    
    sqlFileText = sqlFileText.flat(1);
  
    // Remove comments and minimize white space
    sqlFileText = sqlFileText.map(l => 
        l && l.replace(/--[^\n]*(?:\n|$)/g,'').replace(/\s+/g,' ').trim()
    ).filter(Boolean);

    // logger.debug(sqlFileText);
    return sqlFileText;
}

module.exports = {
    query, loadFiles,
    operation: db.runOperation,
    init: db.openConnection,
    deinit: db.closeConnection,
    execFiles: pathArray => loadFiles(pathArray).then(text => query(text,[]))
}
