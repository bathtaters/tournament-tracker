/* *** PLAYER Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').player;
const defs = require('../../config/validation').config.defaults.player;


// Player Table Operations //

// Get single or all (ids only) players
const get = id => db.getRow('player', id);
const list = () => db.getRow('player',null,'id').then(r => r && r.map(p => p.id));

// Get Draft detail for player
const getPlayerDrafts = playerId => db.getRows('draft', strings.draftFilter, [playerId], 'id');

// Add new player
const add = playerData => db.addRow('player', { ...defs, ...playerData });


module.exports = {
    get, list, add,
    getPlayerDrafts,
    
    rmv: id => db.rmvRow('player', id),
    set: (id, newParams) => db.updateRow('player', id, newParams),
}