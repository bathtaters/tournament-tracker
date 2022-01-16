/* *** SIMPLE SQL UI *** */
const advanced = require('./advancedAccess');
const { strTest, queryVars, getReturn, getFirst, getSolo } = require('../../services/sqlUtils');

// Custom query
const query = (text, args, splitArgs) => advanced.query(text, args, splitArgs)
    .then(getSolo(text)).then(getReturn);

// Simple Shared Ops
const getRows = (table, sqlFilter, args = null, cols = null, client = null) => 
    // strTest(table) || strTest(sqlFilter) || strTest(cols) ||
    (client || advanced).query(
        `SELECT ${
            !cols ? '*' : Array.isArray(cols) ? cols.join(', ') || '*' : cols
        } FROM ${table} ${sqlFilter || ''};`,
        args || []
    ).then(getSolo()).then(getReturn);


const getRow = (table, rowId = null, cols = null, client = null) => 
    // strTest(table) || strTest(cols);
    module.exports.getRows( // exports required for unit testing
        table,
        rowId ? 'WHERE id = $1' : '',
        rowId && [rowId],
        cols, client
    ).then(getFirst(rowId));


const addRow = (table, colObj, client = null) => {
    // strTest(table);
    const keys = Object.keys(colObj || {});
    if (!keys.length) console.warn("Added empty row to "+table);
    strTest(keys);
    return (client || advanced).query(
        `INSERT INTO ${table} ${
            keys.length ? '('+keys.join(',')+')' : 'DEFAULT'
        } VALUES${
            keys.length ? ' ('+queryVars(keys)+')' : ''
        } RETURNING id;`,
        Object.values(colObj || {})
    ).then(getSolo()).then(getReturn).then(getFirst());
};

const rmvRow = (table, rowId, client = null) => 
    // strTest(table) ||
    (client || advanced).query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id;`,
        [rowId]
    ).then(getSolo()).then(getReturn).then(getFirst());

const updateRow = (table, rowId, updateObj, returning = 'id', client = null) => {
    // strTest(table) || strTest(returning);
    const keys = Object.keys(updateObj || {});
    if (!keys.length) throw new Error("No properties provided to update "+table+"["+rowId+"]");
    strTest(keys);
    return (client || advanced).query(
        `UPDATE ${table} SET ${
            keys.map((col,idx) => `${col} = $${idx+2}`).join(', ')
        } WHERE id = $1 RETURNING ${returning || 'id'};`,
        [rowId, ...Object.values(updateObj || {})]
    ).then(getSolo()).then(getReturn).then(getFirst())
    .then(ret => ({
        id: rowId,
        ...(updateObj || {}),
        ...(ret || {error: 'Missing return value.'})
    }));
};


module.exports = { 
    query,
    getRow, getRows,
    addRow, rmvRow, updateRow,
    operation: op => advanced.operation(op).then(getReturn),
    file: (...files) => advanced.execFiles(files).then(getReturn),
}