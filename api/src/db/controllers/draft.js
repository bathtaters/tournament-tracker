/* *** DRAFT Object *** */
const ops = require('../admin/basicAccess');
const Raw = require('../admin/RawPG');
const strings = require('../sql/strings').draft;
const defs = require('../../config/validation').config.defaults.draft;
const newRound = require('../../services/newRound');
const { toBreakers } = require('../../services/results');


// Draft Table Operations //


const get = date => ops.query(strings.getByDay[+!date], date ? [date] : []);


// Get schedule object { day: [draftIds,...], ... }
const getSchedule = date => ops.query(strings.schedule[+!date], date ? [date] : [])
    .then(r => !r || !date ? r : r.drafts);


// Get breakers object { playerId: { [match|game]Points, [m|g]Percent, opp[M|G]Percent,  } ... rankings: [playerId] }
const getBreakers = draftId => ops.query(
    strings.breakers + (draftId ? strings.byDraftId : ''),
    draftId && [draftId], false
).then(res => res && toBreakers([res]));


function add (draftData) {
    draftData = { ...defs, ...draftData };
    draftData.players = (draftData.players || []).map(Raw); // Convert to UUID[]
    return ops.addRow('draft', draftData);
}


// Append a new round to a draft
async function pushRound(draftId) {
    // Collect data
    const data = await ops.operation(async cl => {
        const draftData = await ops.getRow('draftReport', draftId, 0, cl);
        if (!draftData) throw Error("Invalid draft or error connecting.");
        
        const drops = await ops.getRow('draftDrops', draftId, 'drops', cl).then(r => r && r.drops);
        const breakers = await ops.getRows('breakers', strings.byDraftId, [draftId], 0, cl);

        return { draftData, drops, breakers };
    });
    
    // Generate new round queries
    const [text, args] = newRound(data);
    await ops.query(text, args, true);

     return { id: draftId };
}


// Remove a round from the draft
async function popRound(draftId, round = null) {
    // Get round num
    if (!round) {
        round = await ops.query(strings.maxRound, [draftId])
            .then(r => (r[0] || r || {}).round );
    }
    if (round == null) throw new Error("No matches found.");

    return ops.operation(cl => Promise.all([
        // Delete matches
        cl.query(strings.deleteRound, [draftId, round]),
        // Decrease active round counter
        ops.updateRow('draft', draftId, { roundactive: round - 1 }, 'id', cl)
    ])).then(() => ({ id: draftId, round }));
}


// const reportByes = (draftId, rnd, wins, cl = ops) => cl.query(strings.reportByes, [draftId, rnd, wins]);


module.exports = {
    get, getSchedule, getBreakers,
    add, pushRound, popRound,

    getDetail: id => ops.getRow('draftDetail', id),
    getDrops: id => ops.getRow('draftDrops', id).then(r => (r && r.drops) || []),
    rmv:  id => ops.rmvRow('draft', id),
    set: (id, newParams) => ops.updateRow('draft', id, newParams)
}