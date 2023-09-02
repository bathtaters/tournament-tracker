/* *** PLAN PLAYER Object *** */
const db = require('../admin/interface');
const defs = require('../../config/validation').defaults.planplayer;

// Get single or all vote data
const get = (id) => db.getRow('planplayer', id)

// Add player to plan
const add = (id) => db.addRow('planplayer', { ...defs, id });

// Remove player from the plan
const rmv = (id) => db.rmvRow('planplayer', id);

// Set player's votes
const set = (id, newData) => db.updateRow('planplayer', id, newData);

module.exports = { get, add, rmv, set }
