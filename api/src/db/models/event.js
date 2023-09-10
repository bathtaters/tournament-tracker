/* *** EVENT Table Operations *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').event;

// Get event data
async function get(id, detail = false, planOnly = false) {
    if (!id) return db.getRows('event', planOnly ? 'WHERE plan = TRUE' : undefined);

    const eventData = await db.getRow('event'+(detail ? 'Detail' : ''), id);
    if (!eventData || eventData.length === 0) return;
    if (eventData.drops && eventData.drops.length) eventData.drops = eventData.drops.flat(1);
    return eventData;
};

const getSchedule = (planOnly) => db.query(`${strings.schedule.prefix}${
    planOnly ? strings.schedule.planOnly : strings.schedule.useSettings
}${strings.schedule.suffix}`);

const getOpponents = (eventid, completed=true) => eventid ?
    db.getRow('eventOpps', eventid, null, { idCol: 'eventid', getOne: false }) :
    db.getRows('eventOpps', completed && strings.complete);

const getPlayers = id => db.getRow('event', id, 'players');

const getLastSlot = (day, id) => {
    const qry = strings.maxSlot[0]
        + (day ? 'day = $1' : 'day IS NULL')
        + (!id ? '' : day ? ' AND id != $2' : ' AND id != $1')
        + strings.maxSlot[1];
    return db.query(qry, [day, id].filter(Boolean)).then(r => (r?.[0]?.slot || 0));
}

const getRound = id => db.query(strings.maxRound, [id]).then(r => r?.[0]?.round);


// Create new event
const add = eventData => {
    eventData.players = (eventData.players || []);
    return db.addRow('event', eventData);
}


const pushRound = (eventid, round, matchData) => db.operation(client => Promise.all([
    // Increase active round counter
    db.updateRow(
        'event', eventid,
        { roundactive: round },
        { returning: 'roundactive', client }
    ),
    // Create matches
    matchData && db.addRows('match', matchData, { client }),
]));


const popRound = (eventid, round) => db.operation(client => Promise.all([
    // Delete matches
    client.query(strings.deleteRound, [eventid, round]),
    // Decrease active round counter
    db.updateRow(
        'event', eventid,
        { roundactive: round - 1 },
        { returning: 'roundactive', client }
    ),
]));


module.exports = {
    get,
    getSchedule, getOpponents, getPlayers, 
    getLastSlot, getRound,
    
    add, popRound, pushRound,

    rmv:  id => db.rmvRow('event', id),
    set: (id, newParams) => db.updateRow('event', id, newParams),
    setPlan: (ids) => db.query(strings.plan, [ids]),
}