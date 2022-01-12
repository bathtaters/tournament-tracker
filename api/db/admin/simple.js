const base = require('./base');
const { strTest, queryVars, } = require('../../services/sqlUtils');

// Simple Shared Ops
const getRow = (table, rowId, cols = null) => 
    // strTest(table) ||
    base.query(
        `SELECT ${cols || '*'} FROM ${table}${rowId ? ' WHERE id = $1' : ''};`,
        rowId ? [rowId] : []
    );

const addRow = (table, colObj) => {
    // strTest(table);
    const keys = Object.keys(colObj);
    keys.forEach(strTest);
    return base.query(
        `INSERT INTO ${table}(${
            keys.join(',')
        }) VALUES(${queryVars(keys)}) RETURNING id;`,
        Object.values(colObj)
    )
};

const rmvRow = (table, rowId) => 
    // strTest(table) ||
    base.query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id;`,
        [rowId]
    );

const updateRow = (table, rowId, updateObj, returning = 'id') => {
    // strTest(table);
    const keys = Object.keys(updateObj);
    keys.forEach(strTest);
    return base.query(
        `UPDATE ${table} SET (${
            keys.join(',')
        }) = (${queryVars(keys,2)}) WHERE id = $1 RETURNING ${returning};`,
        [rowId, ...Object.values(updateObj)]
    ).then(ret=>({id: rowId, ...updateObj, ...ret}));
};

module.exports = { getRow, addRow, rmvRow, updateRow, }