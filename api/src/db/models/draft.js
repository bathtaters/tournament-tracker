/* *** DRAFT Object *** */
const db = require('../admin/interface');
const Raw = require('../admin/RawPG');
const strings = require('../sql/strings').draft;



// Draft Table Operations //
const get = date => db.query(strings.getByDay[+!date], date ? [date] : []);
const getSchedule = () => db.query(strings.schedule);

const getDraftRound = id => db.query(strings.maxRound, [id]).then(r => (r[0] || r || {}).round );
const getDraftReport = draftId => db.operation(async cl => {
    const draftData = await db.getRow('draftReport', draftId, 0, cl);
    if (!draftData) return;
    
    const drops = await db.getRow('draftDrops', draftId, 'drops', cl).then(r => r && r.drops);
    const breakers = await db.getRows('breakers', strings.byDraftId, [draftId], 0, cl);
    return { draftData, drops, breakers };
});

// Get breakers object { playerId: { [match|game]Points, [m|g]Percent, opp[M|G]Percent,  } ... rankings: [playerId] }
const getBreakers = draftId => db.query(
    strings.breakers + (draftId ? strings.byDraftId : ''),
    draftId && [draftId], false
);

// Create new draft
const add = draftData => {
    draftData.players = (draftData.players || []).map(Raw); // Convert to UUID[]
    return db.addRow('draft', draftData);
}

// Remove a round from the draft
const popRound = (draftId, round) => db.operation(cl => Promise.all([
    // Delete matches
    cl.query(strings.deleteRound, [draftId, round]),
    // Decrease active round counter
    db.updateRow('draft', draftId, { roundactive: round - 1 }, 'roundactive', cl)
]));

// const reportByes = (draftId, rnd, wins, cl = db) => cl.query(strings.reportByes, [draftId, rnd, wins]);


module.exports = {
    get,
    getSchedule, getBreakers,
    getDraftReport, getDraftRound,
    add, popRound,

    getDraftDetail: id => db.getRow('draftDetail', id),
    getDraftDrops: id => db.getRow('draftDrops', id).then(r => (r && r.drops) || []),
    rmv:  id => db.rmvRow('draft', id),
    set: (id, newParams) => db.updateRow('draft', id, newParams)
}