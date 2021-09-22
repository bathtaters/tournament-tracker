/* *** DRAFT Object *** */

// Basic settings
const defVal = {
    title: null, day: null,
    players: [], bestOf: 3,
    roundCount: 3, clockLimit: 3600,
};
const limits = {
    title: {min: 0, max: 50},
    bestOf: {min: 1, max: 7},
    roundCount: {min: 1, max: 10},
    clockLimit: {min: 1, max: 24*60*60},
};

// Advanced validation
const { body, param } = require('express-validator');
const validator = () => [
    param('draftId').isUUID(4),
    body('title').optional().isAscii().bail().stripLow().isLength(limits.title).escape(),
    body('day').optional().isDate().bail().toDate(),
    body('bestOf').optional().isInt(limits.teamSize).bail().toInt(),
    body('roundCount').optional().isInt(limits.roundCount).bail().toInt(),
    body('clockLimit').optional().isInt(limits.clockLimit).bail().toInt(),
];

// Draft Ops
const ops = require('./admin/base');

const dayList = () => ops.accessDb(cl => cl.query(
    "SELECT DISTINCT day FROM draft@date_idx;"
));

function list(date) {
    if (!date)
        return ops.accessDb(cl => cl.query(
            "SELECT * FROM draft ORDER BY INDEX draft@date_idx;"
        ));
    return ops.accessDb(cl => cl.query(
        "SELECT * FROM draft WHERE day = $1 ORDER BY INDEX draft@date_idx;",
        [date]
    ));
}

const add = ({ title, day, roundCount, bestOf, clockLimit, players }) => ops.accessDb(cl => cl.query(
    "INSERT INTO draft(title, day, roundCount, bestOf, clockLimit, players) VALUES($1, $2, $3, $4, $5, ($6)::UUID[]) RETURNING id;",
    [
        title || defVal.title,
        day || defVal.day,
        roundCount || defVal.roundCount,
        bestOf || defVal.bestOf,
        clockLimit || defVal.clockLimit,
        players || defVal.players
    ]
)).then(r=>r && r[0].id);


// Player Ops

function getPlayers(draftId) {
    return ops.accessDb(async cl => {
        const players = {};
        players.all = await cl.query(
            "SELECT DISTINCT unnest(players) FROM match@draft_idx WHERE draft = $1;",
            [draftId]
        ).then(r=>r.rows.map(p=>p.unnest));
        const active = await cl.query(
            "SELECT players FROM draft WHERE id = $1;",
            [draftId]
        ).then(r=>r.rows[0].players);
        players.dropped = players.all.filter(p => !active.includes(p));
        return {rows: players};
    });
}

function addPlayer(draftId, playerId) {
    return ops.accessDb(cl => cl.query(
        "UPDATE draft SET players = players || $1 WHERE id = $2;",
        [playerId, draftId]
    ));
}
    
function dropPlayer(draftId, playerId) {
    return ops.accessDb(cl => cl.query(
        "UPDATE draft SET players = array_remove(players, $1) WHERE id = $2;",
        [playerId, draftId]
    ));
}

// Exports
module.exports = {
    dayList, list, getPlayers,
    add, addPlayer, dropPlayer,
    get: id => ops.getRow('draft', id),
    rmv:  id => ops.rmvRow('draft', id),
    set: (id, newParams) => ops.updateRow('draft', id, newParams),
    limits, validator,
}