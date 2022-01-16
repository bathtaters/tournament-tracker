


//     TEAMS ARE NON-FUNCTIONAL     //
//       MUST BE RE-DESIGNED        //





/* *** TEAM (PLAYER) Sub-Object *** */
const ops = require('../admin/basicAccess');
const { set, swap } = require('./player');


// Team Queries
const teamQueries = {
    addMember:  "UPDATE player SET members = members || $1 WHERE isTeam = TRUE AND id = $2;",
    rmvMember:  "UPDATE player SET members = array_remove(members, $1) WHERE isTeam = TRUE AND id = $2;",
    replMember: "UPDATE player SET members = array_replace(members, $1, $2) WHERE isTeam = TRUE AND id = $3;",
    replMember2: " UPDATE player SET members = array_replace(members, $2, $1) WHERE isTeam = TRUE AND id = $4;",
}


// Team Table Operations //

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

module.exports = {
    get, set, swap, // passthrough to player
    list, add, rmv,
    addMember, rmvMember,
    replaceMember, swapMembers,
}