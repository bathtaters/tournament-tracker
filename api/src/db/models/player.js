/* *** PLAYER Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').player;
const defs = require('../../config/validation').defaults.player;


// Player Table Operations //

// Get single or all (ids only) players
const get = id => db.getRow('player', id);
const list = () => db.getRow('player',null,'id').then(r => r && r.map(p => p.id));

// Get Event detail for player
const getPlayerEvents = playerids => db.query(playerids.map(() => strings.eventFilter), playerids.map(id => [id]), true)

// Get Match detail for player
const getPlayerMatches = playerid => db.getRow('matchDetail', playerid, null, { idCol: 'ANY(players)', getOne: false });

// Add new player
const add = playerData => db.addRow('player', { ...defs, ...playerData });


module.exports = {
    get, list, add,
    getPlayerEvents,
    getPlayerMatches,
    
    rmv: id => db.rmvRow('player', id),
    set: (id, newParams) => db.updateRow('player', id, newParams),
}