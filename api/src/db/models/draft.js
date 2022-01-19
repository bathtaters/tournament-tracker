/* *** DRAFT Table Operations *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').draft;

// Get draft data
const get = date => db.query(strings.getByDay[+!date], date ? [date] : []);
const getSchedule = () => db.query(strings.schedule);

const getDraftRound = id => db.query(strings.maxRound, [id]).then(r => (r[0] || r || {}).round );
const getDraftReport = draftId => db.operation(async cl => {
    const draftData = await db.getRow('draftReport', draftId, 0, cl);
    if (!draftData || draftData.length === 0) return;
    
    const drops = await db.getRow('draftDrops', draftId, 'drops', cl).then(r => r && r.drops);
    const breakers = await db.getRows('breakers', strings.byDraftId, [draftId], 0, cl);
    return { draftData, drops, breakers };
});

// Breakers object: { playerId: { [match|game]Points, [m|g]Percent, opp[M|G]Percent,  } ... rankings: [playerId] }
const getBreakers = draftId => db.query(
    strings.breakers + (draftId ? strings.byDraftId : ''),
    draftId && [draftId], false
);

// Create new draft
const add = draftData => {
    draftData.players = (draftData.players || []);
    return db.addRow('draft', draftData);
}


const pushRound = (draftId, round, matchData) => db.operation(client => Promise.all([
    // Increase active round counter
    db.updateRow(
        'draft', draftId,
        { roundactive: round },
        { returning: 'roundactive', client }
    ),
    // Create matches
    matchData && db.addRows('match', matchData, { client }),
]));


const popRound = (draftId, round) => db.operation(client => Promise.all([
    // Delete matches
    client.query(strings.deleteRound, [draftId, round]),
    // Decrease active round counter
    db.updateRow(
        'draft', draftId,
        { roundactive: round - 1 },
        { returning: 'roundactive', client }
    ),
]));


module.exports = {
    get,
    getSchedule, getBreakers,
    getDraftReport, getDraftRound,
    add, popRound, pushRound,

    getDraftDetail: id => db.getRow('draftDetail', id),
    getDraftDrops: id => db.getRow('draftDrops', id).then(r => (r && r.drops) || []),
    rmv:  id => db.rmvRow('draft', id),
    set: (id, newParams) => db.updateRow('draft', id, newParams)
}