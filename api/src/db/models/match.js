/* *** MATCH Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').match;
const { arrToObj } = require('../../utils/utils');

// Create empty report object
const defs = require('../../config/validation').config.defaults.match;
const emptyReport = {
    players: defs.players,
    draws: defs.draws,
    drops: defs.drops,
    reported: true,
};


// Match Table Operations //


const get = (matchId, detail) => db.getRow(detail ? strings.detail : 'match', matchId);


const listByDraft = draftId => db.query(strings.list, [draftId])
    .then(r => r && r.reduce((res,next) => {
        // Create round array w/ matchIds
        res[next.round - 1] = next.matches;
        return res;
    }, []));

const getByDraft = draftId =>
    db.getRows(strings.detail, draftId && "WHERE draftId = $1", draftId && [draftId])
        .then(arrToObj('id', false));

        
// Report as { players: {playerId: winCount, ...} , draws: drawCount, drops: [droppedPlayers] }
const report = (matchId, results) =>
    db.updateRow('match', matchId, { ...emptyReport, ...results }, 'draftId')
        .then(r => ({ draftId: r && r.draftid, id: matchId }));


// Clear reporting for match
const unreport = (matchId) => db.operation(async cl => {
    // Get players
    const match = await db.getRow('match', matchId, ['players','draftId'], cl);
    if (!match) throw new Error("Match not found or invalid.");

    // Clear report
    const upd = await db.updateRow('match', matchId, {
        ...emptyReport,
        players: match.players,
        reported: false
    }, 'id', cl);
    return { draftId: match.draftid, id: upd && upd.id };
});


// Update report data partially
const update = (id, { players, ...other } = {}) => db.operation(async cl => {
    let ret;
    // Set non-player data
    if (other   && Object.keys(other).length)
        ret = await db.updateRow('match', id, other, 'draftId', cl);
    // Set player wins
    if (players && Object.keys(players).length) {
        ret = await db.getRow('match', id, ['draftid','players'], cl);
        await db.updateRow('match', id, { players: Object.assign(ret.players, players) }, 'id', cl);
    }
    return { draftId: ret && ret.draftid, id };
});


module.exports = {
    get, listByDraft, getByDraft, 
    report, unreport, update,
}