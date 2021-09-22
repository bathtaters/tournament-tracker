/* *** TEAM (PLAYER) Sub-Object *** */
const ops = require('./admin/base');
const { teamQueries } = require('./constants');

// Basic settings
// const defVal = {name: null};
const limits = {
    name: require('./player').limits.name,
    members: { min: 2, max: 10 },
};

// Advanced validation
const { body, param } = require('express-validator');
const { validateArray, sanitizeArray } = require('../services/utils');
const { isUUID } = require('validator').default;
const validator = () => [
    param('teamId').isUUID(4),
    body('name').optional().isAscii().bail()
        .stripLow().isLength(limits.name).escape(),
    body('members')
        .custom(validateArray(limits.members, m => isUUID(m,4)))
        .customSanitizer(sanitizeArray()),
];

// Team Ops
const list = () => ops.accessDb(cl => cl.query(
    "SELECT * FROM player@team_idx WHERE isTeam = TRUE;"
));

const add = (members, withName=null) => ops.accessDb(async cl => {
    const teamId = await cl.query(
        "INSERT INTO player(isTeam, members, name) VALUES(TRUE, ($1)::UUID[], $2) RETURNING id;",
        [members, withName]
    ).then(r => r.rows[0].id);
    
    return cl.query(
        teamQueries.addTeamList + "ANY($2);",
        [teamId, members]
    );
});

const rmv = teamId => ops.accessDb(async cl => {
    const players = await cl.query(
        "DELETE FROM player WHERE id = $1 RETURNING members;",
        [teamId]
    ).then(r => r.rows[0].members);
    
    return cl.query(
        teamQueries.rmvTeamList + "ANY($2);",
        [teamId, players]
    );
});

// Switch in/out members
const addMember = (teamId, playerId) => ops.accessDb( cl => Promise.all([
    cl.query(teamQueries.addMember, [playerId, teamId]),
    cl.query(teamQueries.addTeamList + "$2;", [teamId, playerId]),
]));

const rmvMember = (teamId, playerId) => ops.accessDb( cl => Promise.all([
    cl.query(teamQueries.rmvMember, [playerId, teamId]),
    cl.query(teamQueries.rmvTeamList + "$2;", [teamId, playerId]),
]));

const replace = (teamId, oldPlayerId, newPlayerId) => ops.accessDb( cl => Promise.all([
    cl.query(teamQueries.replMember, [oldPlayerId, newPlayerId, teamId]),
    cl.query(teamQueries.rmvTeamList + "$2;", [teamId, oldPlayerId]),
    cl.query(teamQueries.addTeamList + "$2;", [teamId, newPlayerId]),
]));

const swap = (playerIdL, teamIdL, playerIdR, teamIdR) => ops.accessDb( cl => Promise.all([
    cl.query(teamQueries.replMember, [playerIdL, playerIdR, teamIdL]),
    cl.query(teamQueries.replMember, [playerIdR, playerIdL, teamIdR]),
    cl.query(teamQueries.replTeamList + "$3;", [teamIdL, teamIdR, playerIdL]),
    cl.query(teamQueries.replTeamList + "$3;", [teamIdR, teamIdL, playerIdR]),
]));

// TO DO: Consolidate teams (remove teams that are no longer tied to games)

module.exports = {
    list, add, rmv,
    addMember, rmvMember,
    replace, swap,
    limits, validator
}