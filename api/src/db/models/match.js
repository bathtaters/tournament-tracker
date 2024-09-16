/* *** MATCH Object *** */
const db = require('../admin/interface');
const log = require('./log');
const strings = require('../sql/strings').match;
const { filtering } = require('../../utils/shared.utils');

// Match Table Operations //

// Get match base or match detail
const get = (matchId, detail = false, fields = null) => db.getRow('match'+(detail ? 'Detail' : ''), matchId, fields);

const getMulti = (matchIds, detail = false, fields = null) => db.operation(client =>
    Promise.all(matchIds.map(id => 
        db.getRow('match'+(detail ? 'Detail' : ''), id, fields, { client })
    ))
);

// Get a list of player IDs w/ their match frequency (vars: id, opp, count)
const getMatchups = (eventId) => db.query(strings.allCounts, [eventId]);

// Get list of IDs only
const listByEvent = eventid => db.query(strings.list, [eventid]);

// Get detail from each match
const getByEvent = eventid => db.getRow('matchDetail', eventid, null, { idCol: 'eventid', getOne: false });

// Get all match details for stats
const getAll = (completed = true) => db.getRows(
    'matchDetail',
    completed && strings.complete, null,
    completed && 'matchDetail.*'
);

// Drop/Undrop player from match
const dropPlayer = (id, player, drop, req) => log.query(drop ? strings.drop : strings.undrop, [id, player], (data, error) => 
    error ? {
        dbtable: log.TableName.MATCH,
        action: log.LogAction.UPDATE,
        tableid: id,
        data: { [`drop.${drop ? 'push' : 'pop'}`]: player },
        error,
    } : {
        dbtable: log.TableName.MATCH,
        action: log.LogAction.UPDATE,
        tableid: data.id,
        data: { drops: data.drops },
    },
    req,
).then((r) => r?.[0])

// Update match data (Providing match.player will overwrite entire object)
const update = (id, newData, req) => log.updateRows('match', id, newData, req);

const updateMulti = (dataArray, req) => db.operation((client) =>
    Promise.all(dataArray.map((data) => data.id ?
        log.updateRows('match', data.id, filtering(data, ['id']), req, { client })
        :
        log.addEntries({
            dbtable: log.TableName.MATCH,
            action: log.LogAction.UPDATE,
            data,
            error: "No ID provided"
        }, req).then(() => ({ ...data, error: 'No ID provided' }))
    ))
);

// Update match.wins only
const updateWins = async (id, index, wins, req) => {
    // Get
    const data = await db.getRow('match', id, 'eventid, wins');
    if (!data || !data.wins) return data;
    // Set
    data.wins[index] = wins;
    return log.updateRows('match', id, { wins: data.wins }, req);
}
// This can replace the above function but doesn't work in CockroachDB:
// log.updateRows('match', id, { [`wins[${index+1}]`]: wins }, req);


module.exports = {
    get, getMulti, getMatchups, listByEvent, getByEvent, getAll,
    dropPlayer, update, updateMulti, updateWins,
}