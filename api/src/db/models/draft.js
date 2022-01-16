/* *** DRAFT Object *** */
const db = require('../admin/interface');
const Raw = require('../admin/RawPG');
const strings = require('../sql/strings').draft;
const defs = require('../../config/validation').config.defaults.draft;
const newRound = require('../../services/newRound');
const { toBreakers } = require('../../services/results');


// Draft Table Operations //


const get = date => db.query(strings.getByDay[+!date], date ? [date] : []);


// Get schedule object { day: [draftIds,...], ... }
const getSchedule = date => db.query(strings.schedule[+!date], date ? [date] : [])
    .then(r => !r || !date ? r : r.drafts);


// Get breakers object { playerId: { [match|game]Points, [m|g]Percent, opp[M|G]Percent,  } ... rankings: [playerId] }
const getBreakers = draftId => db.query(
    strings.breakers + (draftId ? strings.byDraftId : ''),
    draftId && [draftId], false
).then(res => res && toBreakers([res]));


function add (draftData) {
    draftData = { ...defs, ...draftData };
    draftData.players = (draftData.players || []).map(Raw); // Convert to UUID[]
    return db.addRow('draft', draftData);
}
db

// Append a new round to a draft
async function pushRound(draftId) {
    // Collect data
    const data = await db.operation(async cl => {
        const draftData = await db.getRow('draftReport', draftId, 0, cl);
        if (!draftData) throw Error("Invalid draft or error connecting.");
        
        const drops = await db.getRow('draftDrops', draftId, 'drops', cl).then(r => r && r.drops);
        const breakers = await db.getRows('breakers', strings.byDraftId, [draftId], 0, cl);

        return { draftData, drops, breakers };
    });
    
    // Generate new round queries
    const [text, args] = newRound(data);
    await db.query(text, args, true);

     return { id: draftId };
}


// Remove a round from the draft
async function popRound(draftId, round = null) {
    // Get round num
    if (!round) {
        round = await db.query(strings.maxRound, [draftId])
            .then(r => (r[0] || r || {}).round );
    }
    if (round == null) throw new Error("No matches found.");

    return db.operation(cl => Promise.all([
        // Delete matches
        cl.query(strings.deleteRound, [draftId, round]),
        // Decrease active round counter
        db.updateRow('draft', draftId, { roundactive: round - 1 }, 'id', cl)
    ])).then(() => ({ id: draftId, round }));
}


// const reportByes = (draftId, rnd, wins, cl = db) => cl.query(strings.reportByes, [draftId, rnd, wins]);


module.exports = {
    get, getSchedule, getBreakers,
    add, pushRound, popRound,

    getDetail: id => db.getRow('draftDetail', id),
    getDrops: id => db.getRow('draftDrops', id).then(r => (r && r.drops) || []),
    rmv:  id => db.rmvRow('draft', id),
    set: (id, newParams) => db.updateRow('draft', id, newParams)
}