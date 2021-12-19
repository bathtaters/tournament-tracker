/* *** PLAYER Object *** */
const ops = require('./admin/base');
const { matchQueries } = require('./constants');

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
    "SELECT "+
        "id, matches, day, isDrop, "+
        "wins, draws, count, "+
        "title, day, roundActive, roundCount "+
    "FROM draftPlayer JOIN draft ON draftId = id "+
    "WHERE playerId = $1 ORDER BY day DESC;",
[playerId]).then(r => r && !Array.isArray(r) ? [r] : r);

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