/* *** SETTINGS Object *** */
const db = require('../admin/interface');
const { asType, getType } = require('../../services/settings');
const strings = require('../sql/strings').settings;


// Batch get settings object
const getAll = () => db.getRows('settings').then(r =>
  Array.isArray(r) ? r.reduce((obj,e) => {
    obj[e.id] = asType(e);
    return obj;
  },{}) : {}
);


//  Batch set from object { id: value }
const rowQuery = n => `($${n*3+1}, $${n*3+2}, $${n*3+3})`;
const rowValues = obj => key => { const {value,type} = getType(obj[key]); return [key,value,type]; };
const batchSet = settings => db.query(
  strings.batch + Object.keys(Object.keys(settings)).map(rowQuery).join(', ') + ';',
  Object.keys(settings).flatMap(rowValues(settings))
);


module.exports = {  
  batchSet, getAll,
  rmv:  id => db.rmvRow('settings', id),
}