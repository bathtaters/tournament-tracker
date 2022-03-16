/* *** SETTINGS Operations *** */
const db = require('../admin/interface');

// Batch get settings object
const getAll = () => db.getRows('settings');

// Batch set from array of row objects
const batchSet = settings => db.addRows('settings', settings, { upsert: 1 });

module.exports = {  
  batchSet, getAll,
  get: settings => Array.isArray(settings) ?
    db.getRows('settings', 'WHERE id = ANY($1)', [settings]) :
    db.getRow('settings', settings),
  rmv:  id => db.rmvRow('settings', id),
}