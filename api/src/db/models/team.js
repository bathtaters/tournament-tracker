


//     TEAMS ARE NON-FUNCTIONAL     //
//       MUST BE RE-DESIGNED        //





/* *** TEAM (PLAYER) Sub-Object *** */
const db = require('../admin/interface');
const log = require('./log');
const { set, swap } = require('./player');


// Team Queries
const teamQueries = {
    addMember:  "UPDATE player SET members = members || $1 WHERE isteam = TRUE AND id = $2;",
    rmvMember:  "UPDATE player SET members = array_remove(members, $1) WHERE isteam = TRUE AND id = $2;",
    replMember: "UPDATE player SET members = array_replace(members, $1, $2) WHERE isteam = TRUE AND id = $3;",
    replMember2: " UPDATE player SET members = array_replace(members, $2, $1) WHERE isteam = TRUE AND id = $4;",
    selectAll: "WHERE isteam = TRUE AND members IS NOT NULL",
    selectTeam: "WHERE isteam = TRUE AND id = $1",
    selectPlayer: "WHERE isteam = TRUE AND members @> ($1)::UUID[]",
    checkPlayers: "WHERE id = ANY($1)::UUID[]",
}


// Team Table Operations //

const list = (playerid) => playerid ?
    db.getRows('player', teamQueries.selectPlayer, [playerid]) :
    db.getRows('player', teamQueries.selectAll)

const add = (members, withName=null, req) => db.operation(async (client) => {
    const memberArr = await db.getRows(
        'player', teamQueries.checkPlayers, [members], ['id', 'isteam'], 0, 0, client
    ).then(r => (r && r.rows) || []);

    if (memberArr?.length !== members.length || memberArr.some(mem => mem.isteam))
        throw new Error("Team members must be players: "+memberArr);

    return log.addRows('player', { members, isteam: true, name: withName }, req, { client })
}).then(r => r[0]);

const rmv = (teamid, req) => log.rmvRows('player', [teamid], teamQueries.selectTeam, req);

// Switch in/out members
const addMember = (teamid, playerid, req) => 
    // Add checks that members aren't teams
    log.query(teamQueries.addMember, [playerid, teamid], (data, error) => ({
        dbtable: log.TableName.PLAYER,
        action: log.LogAction.UPDATE,
        tableid: data?.id || teamid,
        data: data ? { members: data.members } : { "members.push": playerid },
        error,
    }), req);

const replaceMember = (teamid, oldPlayerId, newPlayerId, req) => 
    // Add checks that newPlayer isn't team
    log.query(teamQueries.replMember, [oldPlayerId, newPlayerId, teamid], (data, error) => ({
        dbtable: log.TableName.PLAYER,
        action: log.LogAction.UPDATE,
        tableid: data?.id || teamid,
        data: data ?
            { members: data.members } :
            { "members.push": newPlayerId, "members.pop": oldPlayerId },
        error,
    }), req);
    
const rmvMember = (teamid, playerid, req) =>
    log.query(teamQueries.rmvMember, [playerid, teamid], (data, error) => ({
        dbtable: log.TableName.PLAYER,
        action: log.LogAction.UPDATE,
        tableid: data?.id || teamid,
        data: data ? { members: data.members } : { "members.pop": playerid },
        error,
    }), req);


const swapMembers = (playeridL, teamidL, playeridR, teamidR, req) => log.query(
    teamQueries.replMember + teamQueries.replMember2,
    [playeridL, playeridR, teamidL, teamidR || teamidL],
    (data, error) => [{
        dbtable: log.TableName.PLAYER,
        action: log.LogAction.UPDATE,
        tableid: data?.id || teamidL,
        data: data ?
            { members: data.members } :
            { "members.push": playeridR, "members.pop": playeridL },
        error,
    },{
        dbtable: log.TableName.PLAYER,
        action: log.LogAction.UPDATE,
        tableid: data?.id || teamidR || teamidL,
        data: data ?
            { members: data.members } :
            { "members.push": playeridL, "members.pop": playeridR },
        error,
    }],
    req,
);

// Views
const get = (teamid) => db.getRows('player', teamQueries.selectTeam, [teamid]);

module.exports = {
    get, set, swap, // passthrough to player
    list, add, rmv,
    addMember, rmvMember,
    replaceMember, swapMembers,
}