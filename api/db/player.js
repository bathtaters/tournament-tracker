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
const list = () => ops.query(
    "SELECT * FROM player WHERE isTeam IS FALSE;"
);

const add = name => ops.query(
    "INSERT INTO player(name) VALUES($1) RETURNING id;",
    [name]
).then(r=>r && r.id);

const rename = (id, newName) =>
    ops.updateRow('player', id, {name: newName});

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
    list, add,
    rename, swap,
    get: id => ops.getRow('player', id),
    rmv: id => ops.rmvRow('player', id),
    limits, validator,
}