const db = require('./connect');
const { strTest, queryVars, unnestIfSolo } = require('../../services/sqlUtils');

// Force init on load
if (!db.isConnected()) db.openConnection();

// Base DB controller (Set default maxAttempts/retryCount here)
function operation(clientOp = (client => null), maxAttempts = 15, retryCount = 0) {
    return db.runOperation(clientOp,maxAttempts,retryCount)
        .then(res => res && res.rows || res);
}

// Base DB controller (Set default maxAttempts/retryCount here)
function query(text, args, maxAttempts = 15, retryCount = 0) {
    // Split text/args into arrays
    if (!Array.isArray(text)) text = text.split(';').filter(q=>q.trim());
    text = text.map(q => /;\s*$/.test(q) ? q : q+';');
    const useArgArr = args && args.length === text.length && args.every(Array.isArray);
    
    // console.log('QUERIES:',text);
    return Promise.all(text.map((q,i) => operation(
        client => client.query(q, useArgArr ? args[i] : args),
        maxAttempts, retryCount
    ))).then(res => res && res.map(unnestIfSolo)).then(unnestIfSolo);
}

// Simple Shared Ops
const getRow = (table, rowId, cols) => 
    // strTest(table);
    query(
        `SELECT ${cols || '*'} FROM ${table} WHERE id = $1;`,
        [rowId]
    );

const addRow = (table, colObj) => {
    // strTest(table) || 
    const keys = Object.keys(colObj);
    keys.forEach(strTest);
    return query(
        `INSERT INTO ${table}(${
            keys.join(',')
        }) VALUES(${queryVars(keys)}) RETURNING id;`,
        Object.values(colObj)
    )
};

const rmvRow = (table, rowId) => 
    // strTest(table) ||
    query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id;`,
        [rowId]
    );

const updateRow = (table, rowId, updateObj) => {
    // strTest(table) || 
    const keys = Object.keys(updateObj);
    keys.forEach(strTest);
    return query(
        `UPDATE ${table} SET (${
            keys.join(',')
        }) = (${queryVars(keys,2)}) WHERE id = $1 RETURNING id;`,
        [rowId, ...Object.values(updateObj)]
    ).then(()=>({id: rowId, ...updateObj}));
};

module.exports = {
    operation, query,
    init: db.openConnection,
    deinit: db.closeConnection,
    execFile: db.runSqlFile,
    getRow, addRow, rmvRow, updateRow,
}
