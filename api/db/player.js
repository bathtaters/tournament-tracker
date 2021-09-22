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
const list = () => ops.accessDb(cl => cl.query(
    "SELECT * FROM player@team_idx WHERE isTeam = FALSE ORDER BY name;"
));

const add = name => ops.accessDb(cl => cl.query(
    "INSERT INTO player(name) VALUES($1) RETURNING id;",
    [name]
)).then(r=>r && r[0].id);

const rename = (id, newName) =>
    ops.updateRow('player', id, {name: newName});

// Swap players/teams between matches
function swap(playerIdL, matchIdL, playerIdR, matchIdR) {
    return ops.accessDb(async cl =>  await Promise.all([
        cl.query(matchQueries.swapQuery, [playerIdL, playerIdR, matchIdL]),
        cl.query(matchQueries.swapQuery, [playerIdR, playerIdL, matchIdR]),
    ]));
}

module.exports = {
    list, add,
    rename, swap,
    get: id => ops.getRow('player', id),
    rmv: id => ops.rmvRow('player', id),
    limits, validator,
}