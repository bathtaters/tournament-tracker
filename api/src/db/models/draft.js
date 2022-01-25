/* *** DRAFT Table Operations *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').draft;

// Get draft data
async function get(id, detail=false) {
    if (!id) return db.getRows('draft');

    const draftData = await db.getRow('draft'+(detail ? 'Detail' : ''), id);
    if (!draftData || draftData.length === 0) return;
    if (draftData.drops && draftData.drops.length) draftData.drops = draftData.drops.flat(1);
    return draftData;
};

const getSchedule = () => db.getRows('schedule');

const getOpponents = (draftId, completed=true) => draftId ?
    db.getRow('draftOpps', draftId, null, { idCol: 'draftId', getOne: false }) :
    db.getRows('draftOpps', completed && strings.complete);

const getPlayers = id => db.getRow('draft', id, 'players');

const getRound = id => db.query(strings.maxRound, [id]).then(r => r && (r[0] || r).round);


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
    getSchedule, getOpponents, 
    getPlayers, getRound,
    
    add, popRound, pushRound,

    rmv:  id => db.rmvRow('draft', id),
    set: (id, newParams) => db.updateRow('draft', id, newParams)
}