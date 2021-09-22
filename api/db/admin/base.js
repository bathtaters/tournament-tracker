// Force init on load
const db = require('./connect');
if (!db.isConnected()) db.openConnection();

// Base DB controller (Set default maxAttempts/retryCount here)
function accessDb(operation, maxAttempts = 15, retryCount = 0) {
    return db.runOperation(operation,maxAttempts,retryCount)
        .then(res => res && res.rows);
}

// Simple Shared Ops
const getRow = (table, rowId, cols) => accessDb(cl => {
    // strTest(table);
    // cols && strTest(cols);
    const cmd = `SELECT ${cols || '*'} FROM ${table} WHERE id = $1;`
    return cl.query(cmd, [rowId]);
}).then(r => r && r[0]);

const rmvRow = (table, rowId) => accessDb(cl => {
    // strTest(table);
    const cmd = `DELETE FROM ${table} WHERE id = $1;`
    return cl.query(cmd, [rowId]);
});

function updateRow(table, rowId, updateObj) {
    // strTest(table);
    return accessDb(async cl => {
        for (const col in updateObj) {
            strTest(col);
            const cmd = `UPDATE ${table} SET ${col} = $1 WHERE id = $2;`;
            await cl.query(cmd, [updateObj[col], rowId]);
        }
    }); 
}

module.exports = {
    accessDb,
    init: db.openConnection,
    deinit: db.closeConnection,
    getRow, rmvRow, updateRow,
}

// Test for SQL injection
const strTest = str => { if(/\s|;/.test(str)) throw Error("Possible SQL injection: "+str); };