/* *** PLAYER Object *** */
const ops = require('./admin/base');
const { matchQueries } = require('./constants');
const { insertInOrder } = require('../services/utils');

// Basic settings
// const defVal = {name: null};
const limits = {
    name: { min: 0, max: 50 },
    members: { min: 2, max: 10 },
};

// Advanced validation
const { body, param } = require('express-validator');
const validator = () => [
    param('playerId').isUUID(4),
    body('name').optional().isAscii().bail()
        .stripLow().isLength(limits.name).escape(),
];

// Player Ops
const getDrafts = playerId => ops.query(
    "SELECT id, day, title FROM draft "+
    "WHERE $1::UUID = ANY (players); "+
    "SELECT "+
        "id, matches, day, isDrop, "+
        "wins, draws, count, "+
        "title, day, roundActive, roundCount "+
    "FROM draftPlayer JOIN draft ON draftId = id "+
    "WHERE playerId = $1 ORDER BY day DESC;",
[playerId]).then(r => {
    if (!r) return r;
    if (!Array.isArray(r)) r = [r];

    let res = r[1] || [];
    r[0] && r[0].forEach(a => { 
        if (!res.some(b => a.id === b.id))
            res = insertInOrder(res, a, {asc:0, key:'day'});
    });
    return res;
});

const list = () => ops.query(
    "SELECT * FROM player WHERE isTeam IS FALSE;"
);

const add = ({ name }) => ops.query(
    "INSERT INTO player(name) VALUES($1) RETURNING id;",
    [name]
);

// Swap players/teams between matches
function swap(playerIdL, matchIdL, playerIdR = null, matchIdR = null) {
    return playerIdR ?
        // Swap
        ops.query(
            [matchQueries.swapQuery, matchQueries.swapQuery],
            [[playerIdL, playerIdR, matchIdL],
             [playerIdR, playerIdL, matchIdR || matchIdL]]
        ) :
        // Pop
        ops.query(
            matchQueries.popQuery, [playerIdL, matchIdL]
        );
}

module.exports = {
    list, add, swap,
    getDrafts,
    get: id => ops.getRow('player', id),
    rmv: id => ops.rmvRow('player', id),
    set: (id, newParams) => ops.updateRow('player', id, newParams),
    limits, validator,
}