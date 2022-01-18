/* *** PLAYER Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').player;
const defs = require('../../config/validation').config.defaults.player;


// Player Table Operations //

// Get Draft detail for player
const getPlayerDrafts = playerId => db.operation(cl => Promise.all([
    db.getRows('draft', strings.draftFilter, [playerId], 'id,day,title', cl),
    db.getRows('draftPlayer', strings.draftJoin, [playerId], strings.draftCols, cl),
]));

// Remove player from match
const popPlayer = (playerId, matchId) => db.query(strings.pop, [playerId, matchId], false);

// Swap playerA w/ playerB
const swapPlayers = (playerA, matchA, playerB, matchB) => db.query(
    [strings.swap, strings.swap], 
    [ [playerA, playerB, matchA], [playerB, playerA, matchB] ],
    true
);


module.exports = {
    getPlayerDrafts, popPlayer, swapPlayers,
    get: id => db.getRow('player', id),
    add: playerData => db.addRow('player', { ...defs, ...playerData }),
    rmv: id => db.rmvRow('player', id),
    set: (id, newParams) => db.updateRow('player', id, newParams),
}