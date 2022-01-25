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
const listByDraft = draftId => db.query(strings.list, [draftId]);

// Get detail from each match
const getByDraft = draftId => db.getRow('matchDetail', draftId, null, { idCol: 'draftId', getOne: false });

// Get all match details for breakers
const getAll = (completed = true) => db.getRows(
    'matchDetail',
    completed && strings.complete, null,
    completed && 'matchDetail.*'
);

// Update match data (Providing match.player will overwrite entire object)
const update = (id, newData) => db.updateRow('match', id, newData, { returning: 'draftId' });

const updateMulti = (dataArray, returning = 'draftid') => db.operation(client =>
    Promise.all(dataArray.map(data => 
        data.id ? db.updateRow('match', data.id, filtering(data, ['id']), { returning, client })
        : { ...data, error: 'No ID provided' }
    ))
);

// Update match.player only
const updatePlayer = (id, player) => db.query([strings.setPlayer], [id, player], false).then(r=>r&&r[0]);


module.exports = {
    get, getMulti, listByDraft, getByDraft, getAll,
    update, updateMulti, updatePlayer,
}