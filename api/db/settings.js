/* *** SETTINGS Object *** */

// Imports
const ops = require('./admin/base');
const { arrToObj } = require('../services/utils');

// Convert between values
const asType = ({value, type}) => {
  switch(type) {
    case 'string': return value;
    case 'bigint':
    case 'number': return +value;
    case 'date': return new Date(value);
    case 'boolean':
    case 'object':
    default: return JSON.parse(value);
  }
};
const toType = (value, type) => {
  switch(type) {
    case 'string': return value;
    case 'bigint':
    case 'number': return value.toString();
    case 'date':
    case 'boolean':
    case 'object': 
    default: return JSON.stringify(value);
  }
};
const getType = (value,forceType) => ({ 
  value: toType(value, forceType || typeof value),
  type: forceType || typeof value
});

// Batch get settings object
function getAll() {
  return ops.query('SELECT * FROM settings;').then(r => {
    if (!r || r.length === 0) return r;
    if (!Array.isArray(r)) r = [r];
    return r.reduce((obj,e) => {
      obj[e.id] = asType(e);
      return obj;
    },{});
  });
}

//  Batch set from object { id: value }
const batchBase = 'UPSERT INTO settings (id, value, type) VALUES ';
const rowQuery = n => `($${n*3+1}, $${n*3+2}, $${n*3+3})`;
const rowValues = obj => key => { const {value,type} = getType(obj[key]); return [key,value,type]; };
function batchSet(settingsObject) {
  return ops.query(
    batchBase + Object.keys(Object.keys(settingsObject)).map(rowQuery).join(', ') + ';',
    Object.keys(settingsObject).flatMap(rowValues(settingsObject))
  );
}

// Exports
module.exports = {
  // get:  id => ops.getRow('settings', id).then(r => r && asType(r)),
  rmv:  id => ops.rmvRow('settings', id),
  // add:    (id, newVal, forceType) => ops.addRow('settings', { id, ...getType(newVal,forceType) }),
  // update: (id, newVal, forceType) => ops.updateRow('settings', id, getType(newVal,forceType)),
  batchSet, getAll,
}