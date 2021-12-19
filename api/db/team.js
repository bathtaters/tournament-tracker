/* *** TEAM (PLAYER) Sub-Object *** */
const ops = require('./admin/base');
const { rename, swap } = require('./player');
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
const list = playerId => playerId ?
    ops.query("SELECT team.* FROM player "+
        "JOIN team USING (id) WHERE player.isTeam IS TRUE "+
        "AND player.members @> ($1)::UUID[];", [[playerId]]) :
    ops.query("SELECT * FROM team WHERE members IS NOT NULL;");

const add = (members, withName=null) => ops.operation(async cl => {
    const memberArr = await cl.query(
        "SELECT id, isTeam FROM player WHERE id = ANY($1)::UUID[];", [members]
    ).then(r => (r && r.rows) || []);
    if (
        !memberArr || memberArr.length !== members.length ||
        memberArr.some(mem => mem.isTeam)
    ) throw new Error("Team members must be players: "+memberArr);
    return cl.query(
        withName ?
        "INSERT INTO player(isTeam, members, name) "+
        "VALUES(TRUE, ($1)::UUID[], $2) RETURNING id;":
        "INSERT INTO player(isTeam, members) "+
        "VALUES(TRUE, ($1)::UUID[]) RETURNING id;",
        withName ? [members, withName] : [members]
    );
}).then(r => r[0]);

const rmv = teamId => ops.query(
    "DELETE FROM player WHERE isTeam = TRUE AND id = $1 RETURNING members;",
    [teamId]
).then(r => r.members);

// Switch in/out members
const addMember = (teamId, playerId) => 
    // Add checks that members aren't teams
    ops.query(teamQueries.addMember, [
        Array.isArray(playerId) ? playerId : [playerId],
        teamId
    ]);

const replaceMember = (teamId, oldPlayerId, newPlayerId) => ops.query(
    // Add checks that newPlayer isn't team
    teamQueries.replMember, [oldPlayerId, newPlayerId, teamId]);

const rmvMember = (teamId, playerId) => ops.query(
    teamQueries.rmvMember, [playerId, teamId]);


const swapMembers = (playerIdL, teamIdL, playerIdR, teamIdR) => ops.query(
    teamQueries.replMember + teamQueries.replMember2,
    [playerIdL, playerIdR, teamIdL, teamIdR || teamIdL]
);

// Views
const get = (teamId) => ops.query("SELECT * FROM team WHERE id = $1;",[teamId]);

// TO DO: Consolidate teams (remove teams that are not tied to matches/drafts)

module.exports = {
    list, add, rmv,
    get, rename, swap, // passthrough to player
    addMember, rmvMember,
    replaceMember, swapMembers,
    limits, validator
}