/* *** SIMPLE SQL UI *** */
const logger = console;
const direct = require('./directOps');
const {
    strTest, queryLabels, queryValues,
    getReturn, getFirst, getSolo
} = require('../../utils/dbInterface.utils');

// Custom query
const query = (text, args, splitArgs) => direct.query(text, args, splitArgs)
    .then(getSolo(text)).then(getReturn);


// SELECT
const getRows = (table, sqlFilter, args = null, cols = null, client = null) => 
    // strTest(table) || strTest(sqlFilter) || strTest(cols) ||
    (client || direct).query(
        `SELECT ${
            (Array.isArray(cols) ? cols.join(', ') : cols) || '*'
        } FROM ${table} ${sqlFilter || ''};`,
        args || []
    ).then(getSolo()).then(getReturn);


const getRow = (table, rowId = null, cols = null, { idCol = 'id', getOne = true, client = null } = {}) => 
    // strTest(table) || strTest(cols);
    module.exports.getRows( // exports required for unit testing
        table,
        rowId ? `WHERE ${idCol} = $1${getOne ? ' LIMIT 1' : ''}` : '',
        rowId && [rowId],
        cols, client
    ).then(getFirst(getOne && rowId));


// INSERT/UPSERT
const addRows = (table, objArray, { client = null, upsert = false, returning = 'id' } = {}) => {
    // strTest(table);
    if (!objArray) throw new Error("Missing rows to add to "+table+" table.");
    const keys = objArray[0] ? Object.keys(objArray[0]) : [];
    if (!keys.length) logger.warn("Added empty row to "+table);
    strTest(keys);

    return (client || direct).query(
        `${upsert ? 'UP' : 'IN'}SERT INTO ${table} ${
            keys.length ? '('+keys.join(',')+')' : 'DEFAULT'
        } VALUES ${
            queryLabels(objArray, keys).join(', ')
        }${returning ? ' RETURNING '+returning : ''};`,
        queryValues(objArray, keys)
    ).then(getSolo()).then(getReturn);
};

const addRow = (table, rowObj, options = {}) => 
    module.exports.addRows(table, rowObj ? [rowObj] : [], options)
        .then(getFirst());


// DELETE
const rmvRow = (table, rowId, client = null) => 
    // strTest(table) ||
    (client || direct).query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id;`,
        [rowId]
    ).then(getSolo()).then(getReturn).then(getFirst());


// UPDATE
const updateRow = (table, rowId, updateObj, { returning = null, client = null } = {}) => {
    // strTest(table) || strTest(returning);
    const keys = Object.keys(updateObj || {});

    if (!keys.length) throw new Error("No properties provided to update "+table+"["+rowId+"]");
    strTest(keys);

    return (client || direct).query(
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
    addRows, addRow,
    rmvRow, updateRow,
    operation: op => direct.operation(op).then(getReturn),
    file: (...files) => direct.execFiles(files).then(getReturn),
}