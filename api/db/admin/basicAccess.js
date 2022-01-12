const advanced = require('./advancedAccess');
const { strTest, queryVars, } = require('../../services/sqlUtils');

// Simple Shared Ops
const getRow = (table, rowId, cols = null) => 
    // strTest(table) ||
    advanced.query(
        `SELECT ${
            !cols ? '*' : Array.isArray(cols) ? cols.join(', ') || '*' : cols
        } FROM ${table}${rowId ? ' WHERE id = $1' : ''};`,
        rowId ? [rowId] : []
    );

const addRow = (table, colObj) => {
    // strTest(table);
    const keys = Object.keys(colObj);
    keys.forEach(strTest);
    return advanced.query(
        `INSERT INTO ${table}(${
            keys.join(',')
        }) VALUES(${queryVars(keys)}) RETURNING id;`,
        Object.values(colObj)
    )
};

const rmvRow = (table, rowId) => 
    // strTest(table) ||
    advanced.query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id;`,
        [rowId]
    );

const updateRow = (table, rowId, updateObj, returning = 'id') => {
    // strTest(table);
    const keys = Object.keys(updateObj);
    keys.forEach(strTest);
    return advanced.query(
        `UPDATE ${table} SET ${
            keys.map((col,idx) => `${col} = $${idx+2}`).join(', ')
        } WHERE id = $1 RETURNING ${returning};`,
        [rowId, ...Object.values(updateObj)]
    ).then(ret=>({id: rowId, ...updateObj, ...ret}));
};

module.exports = { 
    getRow, addRow, rmvRow, updateRow,
    query: advanced.query,
    operation: advanced.operation,
    file: (...files) => advanced.execFiles(files)
}