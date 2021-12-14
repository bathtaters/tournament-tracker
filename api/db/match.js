/* *** MATCH Object *** */

// Imports
const ops = require('./admin/base');
const { arrToObj } = require('../services/utils');

// Basic settings
const maxRounds = require('./draft').limits.roundCount;
const limits = {
    players: { min: 1, max: 10 },
    winsDrawsMin: 0,
    roundMin: 1,
};
const drawKey = 'draws';
const resultsKey = 'players';
const dropsKey = 'drops';

// Advanced validation
const { body, param } = require('express-validator');
const { validateArray, sanitizeArray } = require('../services/utils');
const { isUUID } = require('validator').default;
const validator = (maxRounds = maxRounds) => [
    param('matchId').isUUID(4),
    body('draftId').isUUID(4),
    body('round').isInt({min: limits.roundMin, max:maxRounds})
        .bail().toInt(),
    body('players')
        .custom(validateArray(limits.players, m => isUUID(m,4)))
        .customSanitizer(sanitizeArray()),
    body('wins').isInt({min: limits.winsDrawsMin, max:maxRounds})
        .bail().toInt(),
    body('draws').isInt({min: limits.winsDrawsMin, max:maxRounds})
        .bail().toInt(),
];

// Match Ops
function get(matchId, detail = true) {
    return ops.query(
        "SELECT * FROM match "+
        (detail ? "JOIN matchDetail USING (id) " : "")+
        "WHERE id = $1;",
        [matchId]
    );
}

function list(draftId = null, round = null) {
    return !draftId ? ops.query(
            "SELECT draftId, round, array_agg(id) matches "+
            "FROM match@draft_idx GROUP BY draftId, round;"
        ).then(r => r && r.reduce((res,next) => {
            if (!res[next.draftid]) res[next.draftid] = [];
            res[next.draftid][next.round - 1] = next.matches;
            return res;
        }, {}))
        
        : round ? ops.query(
            "SELECT array_agg(id) matches "+
            "FROM match@draft_idx WHERE draftId = $1 AND round = $2 "+
            "GROUP BY round;",
            [draftId, round]
        ).then(r => r && r.matches || r[0].matches)

        : ops.query(
            "SELECT round, array_agg(id) matches "+
            "FROM match@draft_idx WHERE draftId = $1 "+
            "GROUP BY round;",
            [draftId]
        ).then(r => r && (r.matches ? [r] : r).reduce((res,next) => {
            res[next.round - 1] = next.matches;
            return res;
        }, []));
}

function listDetail(draftId, round = null) {
    return (!draftId ? ops.query(
            "SELECT * FROM match JOIN matchDetail USING (id);",
        ) : round ? ops.query(
            "SELECT * FROM match JOIN matchDetail USING (id) "+
            "WHERE draftId = $1 AND round = $2;",
            [draftId, round]
        ) : ops.query(
            "SELECT * FROM match JOIN matchDetail USING (id) "+
            "WHERE draftId = $1;",
            [draftId]
        )
    ).then(arrToObj('id', false));
}


// Report win/loss/draw for a given match
//  Report as { players: {playerId: winCount, ...} , draws: drawCount }
function report(matchId, results) {
    return ops.query(
        "UPDATE match SET (draws, players, drops, reported) = "+
            "($1, ($2), ($3), TRUE) WHERE id = $4 RETURNING draftId;",
        [results[drawKey] || 0, results[resultsKey] || {}, results[dropsKey] || [], matchId]
    ).then(r => ({ draftId: r && r.draftid, id: matchId }));
}

// Clear reporting for match (Reset wins/draws and mark as NOT DONE)
function unreport(matchId) {
    return ops.query(
        "UPDATE match SET (draws, players, drops, reported) = (0, p.w, '{}', FALSE) "+
            "FROM (SELECT jsonb_object_agg(pl::STRING, 0) w "+
                "FROM match, jsonb_object_keys(players) pl "+
                "WHERE id = $1 GROUP BY id) p "+
        "WHERE id = $1 RETURNING draftId;",
        [matchId]
    ).then(r => ({ draftId: r && r.draftid, id: matchId }));
}

// Update report data
async function update(id, { players = {}, ...other }) {
    let ret;
    if (other   && Object.keys(other).length)
        ret = await ops.updateRow('match',id,other,'draftId');
    if (players && Object.keys(players).length) {
        ret = await ops.operation(async cl => {
            let draft;
            for (const playerId in players) {
                draft = await cl.query(
                    "UPDATE match SET players = jsonb_set(players, $1, $2) WHERE id = $3 RETURNING draftId;",
                    [[playerId], players[playerId], id]
                );
            }
            return draft;
        });
    }
    return { draftId: ret && ret[0] && ret[0].draftid, id };
}

// Exports
module.exports = {
    list, listDetail, get, 
    report, unreport, update,
    limits, validator,

    // Direct access
    // more: { getRaw: id => ops.getRow('match', id), set: (id, setFields) => ops.updateRow('match', id, setFields) }
}
