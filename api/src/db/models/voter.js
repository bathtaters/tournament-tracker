/* *** VOTER Object *** */
const db = require('../admin/interface');
const defs = require('../../config/validation').defaults.voter;

// Get single or all vote data
const get = (id) => db.getRow('voter', id)

// Add player as voter
const add = (id) => db.addRow('voter', { ...defs, id });

// Remove player as voter
const rmv = (id) => db.rmvRow('voter', id);

// Set player's votes
const set = (id, newData) => db.updateRow('voter', id, newData);

module.exports = { get, add, rmv, set }
