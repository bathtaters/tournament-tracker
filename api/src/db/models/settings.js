/* *** SETTINGS Operations *** */
const db = require('../admin/interface');
const log = require('./log');

// Batch get settings object
const getAll = () => db.getRows('settings');

// Batch set from array of row objects
const batchSet = (settings, userid) => log.addRows('settings', settings, userid, { upsert: true });

module.exports = {  
  batchSet, getAll,
  get: (settings) => Array.isArray(settings) ?
    db.getRows('settings', 'WHERE id = ANY($1)', [settings]) :
    db.getRow('settings', settings),
  rmv:  (id, userid) => log.rmvRows('settings', id, null, userid),
}