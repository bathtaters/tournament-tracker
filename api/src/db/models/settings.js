/* *** SETTINGS Operations *** */
const db = require('../admin/interface');

// Batch get settings object
const getAll = () => db.getRows('settings');

// Batch set from array of row objects
const batchSet = settings => db.addRows('settings', settings, { upsert: 1 });

module.exports = {  
  batchSet, getAll,
  get: setting => db.getRow('settings',setting),
  rmv:  id => db.rmvRow('settings', id),
}