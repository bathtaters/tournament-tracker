/* *** PLAYER Object *** */
const ops = require('../admin/basicAccess');
const strings = require('../sql/strings').player;
const { insertInOrder } = require('../../helpers/utils');
const defs = require('../../config/validation').config.defaults.player;


// Player Table Operations //


// Get Draft detail for player
const getDrafts = playerId => ops.query(strings.draftDetails,[playerId]).then(r => {
    if (!r) return r;

    // Get player match data
    let res = r[1] || [];

    // Include drafts w/o match data
    r[0] && r[0].forEach(a => { 
        if (!res.some(b => a.id === b.id))
            res = insertInOrder(res, a, {asc:0, key:'day'});
    });
    return res;
});


// Swap players (or teams) between matches
function swap(playerL, matchL, playerR = null, matchR = null) {
    // Remove playerL from matchL
    if (!playerR) return ops.query(strings.pop, [playerL, matchL]);
    // Swap playerL w/ playerR (No matchR swaps w/in matchL)
    return ops.query([strings.swap, strings.swap], [
        [playerL, playerR, matchL],
        [playerR, playerL, matchR || matchL]
    ], true);
}


module.exports = {
    getDrafts, swap,
    get: id => ops.getRow('player', id),
    add: playerData => ops.addRow('player', { ...defs, ...playerData }),
    rmv: id => ops.rmvRow('player', id),
    set: (id, newParams) => ops.updateRow('player', id, newParams),
}