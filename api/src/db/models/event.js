/* *** EVENT Table Operations *** */
const db = require('../admin/interface');
const log = require('./log');
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
const add = (eventData, userid) => {
    eventData.players = (eventData.players || []);
    return log.addRows('event', eventData, userid)
}


const pushRound = (eventid, round, matchData, userid) => db.operation(client => Promise.all([
    // Increase active round counter
    log.updateRows('event', eventid, { roundactive: round }, userid, { client }),
    // Create matches
    matchData && log.addRows('match', matchData, userid, { client }),
]))


const popRound = (eventid, round, userid) => db.operation(client => Promise.all([
    // Delete matches
    log.rmvRows('match', [eventid, round], strings.deleteRound, userid, client),
    // Decrease active round counter
    log.updateRows('event', eventid, { roundactive: round - 1 }, userid, { client }),
]))


const setPlan = (ids, userid) => log.query(strings.plan, [ids], (data, error) => 
    error ? ids.map((tableid) => ({
        tableid, userid, error,
        dbtable: log.TableName.EVENT,
        action: log.LogAction.UPDATE,
        data: { plan: true },
    })) : {
        dbtable: log.TableName.EVENT,
        tableid: data.id,
        data: { plan: data.plan },
        userid,
        action: log.LogAction.UPDATE,
    }
)


module.exports = {
    get,
    getSchedule, getOpponents, getPlayers, 
    getLastSlot, getRound,
    
    add, popRound, pushRound,

    rmv: (id, userid) => log.rmvRows('event', id, null, userid),
    set: (id, newParams, userid) => log.updateRows('event', id, newParams, userid),
    setPlan,
}