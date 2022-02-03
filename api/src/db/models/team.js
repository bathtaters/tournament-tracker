


//     TEAMS ARE NON-FUNCTIONAL     //
//       MUST BE RE-DESIGNED        //





/* *** TEAM (PLAYER) Sub-Object *** */
const db = require('../admin/interface');
const { set, swap } = require('./player');


// Team Queries
const teamQueries = {
    addMember:  "UPDATE player SET members = members || $1 WHERE isteam = TRUE AND id = $2;",
    rmvMember:  "UPDATE player SET members = array_remove(members, $1) WHERE isteam = TRUE AND id = $2;",
    replMember: "UPDATE player SET members = array_replace(members, $1, $2) WHERE isteam = TRUE AND id = $3;",
    replMember2: " UPDATE player SET members = array_replace(members, $2, $1) WHERE isteam = TRUE AND id = $4;",
}


// Team Table Operations //

const list = playerid => playerid ?
    db.query("SELECT team.* FROM player "+
        "JOIN team USING (id) WHERE player.isteam IS TRUE "+
        "AND player.members @> ($1)::UUID[];", [[playerid]]) :
    db.query("SELECT * FROM team WHERE members IS NOT NULL;");

const add = (members, withName=null) => db.operation(async cl => {
    const memberArr = await cl.query(
        "SELECT id, isteam FROM player WHERE id = ANY($1)::UUID[];", [members]
    ).then(r => (r && r.rows) || []);
    if (
        !memberArr || memberArr.length !== members.length ||
        memberArr.some(mem => mem.isteam)
    ) throw new Error("Team members must be players: "+memberArr);
    return cl.query(
        withName ?
        "INSERT INTO player(isteam, members, name) "+
        "VALUES(TRUE, ($1)::UUID[], $2) RETURNING id;":
        "INSERT INTO player(isteam, members) "+
        "VALUES(TRUE, ($1)::UUID[]) RETURNING id;",
        withName ? [members, withName] : [members]
    );
}).then(r => r[0]);

const rmv = teamId => db.query(
    "DELETE FROM player WHERE isteam = TRUE AND id = $1 RETURNING members;",
    [teamId]
).then(r => r.members);

// Switch in/out members
const addMember = (teamId, playerid) => 
    // Add checks that members aren't teams
    db.query(teamQueries.addMember, [
        Array.isArray(playerid) ? playerid : [playerid],
        teamId
    ]);

const replaceMember = (teamId, oldPlayerId, newPlayerId) => db.query(
    // Add checks that newPlayer isn't team
    teamQueries.replMember, [oldPlayerId, newPlayerId, teamId]);

const rmvMember = (teamId, playerid) => db.query(
    teamQueries.rmvMember, [playerid, teamId]);


const swapMembers = (playeridL, teamIdL, playeridR, teamIdR) => db.query(
    teamQueries.replMember + teamQueries.replMember2,
    [playeridL, playeridR, teamIdL, teamIdR || teamIdL]
);

// Views
const get = (teamId) => db.query("SELECT * FROM team WHERE id = $1;",[teamId]);

module.exports = {
    get, set, swap, // passthrough to player
    list, add, rmv,
    addMember, rmvMember,
    replaceMember, swapMembers,
}