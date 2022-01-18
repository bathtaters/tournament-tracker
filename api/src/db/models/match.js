/* *** MATCH Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').match;


// Match Table Operations //

// Get match base or match detail
const get = (matchId, detail, fields = null) => db.getRow(detail ? strings.detail : 'match', matchId, fields);

// Get list of IDs only
const listByDraft = draftId => db.query(strings.list, [draftId]);

// Get detail from each match
const getByDraft = draftId => db.getRows(
    strings.detail,
    draftId && "WHERE draftId = $1",
    draftId && [draftId]
);

// Update match data (Providing match.player will overwrite entire object)
const update = (id, newData) => db.updateRow('match', id, newData, { returning: 'draftId' });

// Update match.player only
const updatePlayer = (id, player) => db.query([strings.setPlayer], [id, player], false).then(r=>r&&r[0]);


module.exports = {
    get, listByDraft, getByDraft, 
    update, updatePlayer,
}