/* *** MATCH Object *** */
const db = require('../admin/interface');
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

// Get list of IDs only
const listByEvent = eventId => db.query(strings.list, [eventId]);

// Get detail from each match
const getByEvent = eventId => db.getRow('matchDetail', eventId, null, { idCol: 'eventId', getOne: false });

// Get all match details for stats
const getAll = (completed = true) => db.getRows(
    'matchDetail',
    completed && strings.complete, null,
    completed && 'matchDetail.*'
);

// Update match data (Providing match.player will overwrite entire object)
const update = (id, newData) => db.updateRow('match', id, newData, { returning: 'eventId' });

const updateMulti = (dataArray, returning = 'eventid') => db.operation(client =>
    Promise.all(dataArray.map(data => 
        data.id ? db.updateRow('match', data.id, filtering(data, ['id']), { returning, client })
        : { ...data, error: 'No ID provided' }
    ))
);

// Update match.player only
const updatePlayer = (id, player) => db.query([strings.setPlayer], [id, player], false).then(r=>r&&r[0]);


module.exports = {
    get, getMulti, listByEvent, getByEvent, getAll,
    update, updateMulti, updatePlayer,
}