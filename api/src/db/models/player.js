/* *** PLAYER Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').player;
const defs = require('../../config/validation').defaults.player;


// Player Table Operations //

// Get single or all (ids only) players
const get = id => db.getRow('player', id);
const list = () => db.getRow('player',null,'id').then(r => r && r.map(p => p.id));

// Get Event detail for player
const getPlayerEvents = playerId => db.getRows('event', strings.eventFilter, [playerId], 'id');

// Add new player
const add = playerData => db.addRow('player', { ...defs, ...playerData });


module.exports = {
    get, list, add,
    getPlayerEvents,
    
    rmv: id => db.rmvRow('player', id),
    set: (id, newParams) => db.updateRow('player', id, newParams),
}