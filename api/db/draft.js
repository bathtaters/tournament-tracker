/* *** DRAFT Object *** */

// Basic settings
const defVal = {
    title: null, day: null,
    players: [], bestOf: 3,
    playersPerMatch: 2,
    roundCount: 3, clockLimit: 3600,
};
const limits = {
    title: {min: 0, max: 50},
    bestOf: {min: 1, max: 7},
    playersPerMatch: {min: 2, max: 8},
    roundCount: {min: 1, max: 10},
    clockLimit: {min: 1, max: 24*60*60},
};

// Advanced validation
const { body, param } = require('express-validator');
const validator = () => [
    param('draftId').isUUID(4),
    body('title').optional().isAscii().bail().stripLow().isLength(limits.title).escape(),
    body('day').optional().isDate().bail().toDate(),
    body('bestOf').optional().isInt(limits.bestOf).bail().toInt(),
    body('playersPerMatch').optional().isInt(limits.playersPerMatch).bail().toInt(),
    body('roundCount').optional().isInt(limits.roundCount).bail().toInt(),
    body('clockLimit').optional().isInt(limits.clockLimit).bail().toInt(),
];

// Draft Ops
const ops = require('./admin/base');

const dayList = () => ops.query(
    "SELECT DISTINCT day FROM draft@date_idx;"
).then(r=>r.map(d=>d.day));

function getByDay(date) {
    return ops.query(date ?
        // id, day, title, roundActive, roundCount
        "SELECT array_agg(id) drafts FROM draft@date_idx WHERE day = $1 GROUP BY day;" :
        "SELECT json_object_agg(k,v) FROM (SELECT COALESCE(to_char(day), 'none') as k, array_agg(id) as v FROM draft@date_idx GROUP BY day);",
        date ? [date] : []
    ).then(r => !r || date ? r : r.json_object_agg);
}

function list(date) {
    return ops.query(date ?
        // id, day, title, roundActive, roundCount
        "SELECT * FROM draft@date_idx WHERE day = $1;" :
        "SELECT * FROM draft ORDER BY INDEX draft@date_idx;",
        date ? [date] : []
    );
}

const add = ({ 
    title = defVal.title,
    day = defVal.day,
    roundCount = defVal.roundCount,
    bestOf = defVal.bestOf,
    playersPerMatch = defVal.playersPerMatch,
    clockLimit = defVal.clockLimit,
    players = defVal.players,
}) => ops.query(
    "INSERT INTO draft("+
        "title, day, roundCount, bestOf, "+
        "playersPerMatch, clockLimit, players"+
    ") VALUES($1, $2, $3, $4, $5, $6, ($7)::UUID[]) RETURNING id;",
    [
        title, day, roundCount, bestOf,
        playersPerMatch, clockLimit, players,
    ]
).then(r=>r && r.id);


// Player Ops
function addPlayer(draftId, playerId) {
    // Check that player is not already in draft
    return ops.operation(cl => cl.query(
        "UPDATE draft SET players = players || $1 WHERE id = $2 RETURNING id;",
        [Array.isArray(playerId) ? playerId : [playerId], draftId]
    ));
}
    
function dropPlayer(draftId, playerId) {
    // Check that player is in draft
    return ops.operation(cl => cl.query(
        // "UPDATE draft SET players = array_remove(players, $1) WHERE id = $2;",
        "UPDATE draft SET players = ARRAY("+
            "SELECT player "+
            "FROM draft, unnest(players) player "+
            "WHERE id = $2 AND player != ALL($1)) "+
        "WHERE id = $2 RETURNING id;",
        [Array.isArray(playerId) ? playerId : [playerId], draftId]
    ));
}

function swapPlayer(draftId, oldPlayerId, newPlayerId) {
    // Check that newplayer is not already in draft && oldplayer is in draft
    return ops.operation(cl => cl.query(
        "UPDATE draft SET players = array_replace(players, $1, $2) WHERE id = $3 RETURNING id;",
        [oldPlayerId, newPlayerId, draftId]
    ));
}

// Exports
module.exports = {
    dayList, list, getByDay,
    add, addPlayer, dropPlayer, swapPlayer,
    get: id => ops.getRow('draft', id),
    getPlayers: id => ops.getRow('allPlayers', id),
    rmv:  id => ops.rmvRow('draft', id),
    set: (id, newParams) => ops.updateRow('draft', id, newParams),
    limits, validator,
}