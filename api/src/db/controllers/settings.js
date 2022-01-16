/* *** SETTINGS Object *** */
const ops = require('../admin/basicAccess');
const { asType, getType } = require('../../services/settings');
const strings = require('../sql/strings').settings;


// Batch get settings object
const getAll = () => ops.getRows('settings').then(r =>
  Array.isArray(r) ? r.reduce((obj,e) => {
    obj[e.id] = asType(e);
    return obj;
  },{}) : {}
);


//  Batch set from object { id: value }
const rowQuery = n => `($${n*3+1}, $${n*3+2}, $${n*3+3})`;
const rowValues = obj => key => { const {value,type} = getType(obj[key]); return [key,value,type]; };
const batchSet = settings => ops.query(
  strings.batch + Object.keys(Object.keys(settings)).map(rowQuery).join(', ') + ';',
  Object.keys(settings).flatMap(rowValues(settings))
);


module.exports = {  
  batchSet, getAll,
  rmv:  id => ops.rmvRow('settings', id),
}