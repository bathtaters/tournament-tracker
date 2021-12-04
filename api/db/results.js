// Imports
const ops = require('./admin/base');
const { toMatchResults, toGameResults, toBreakers } = require('../services/dbResults');
const { breakerBase, breakerOpps } = require('./constants').resultQueries;

// Basic Settings
const drawKey = 'draws';
const resultsKey = 'players';
const draftLims = require('./draft').limits;
const limits = {
    results: {min: 0, max: draftLims.bestOf },
};

// Advanced validation
const { body, param } = require('express-validator');
const base = require('./admin/base');
const player = require('./player');
const validator = () => [
    param('matchId').isUUID(4),
    body('results').isJSON(),
];
// Results.keys should be UUIDs OR 'DRAWS', Results.vals should be ints w/ limits.results



// GET RECORD function will run:

// asGames = false:
//   function toMatchResults(data, asScore, byDraft = true, onlyPlayer = null)
//   Get results based on match (resultAs = record|score)

// asGames = true:
//   function  toGameResults(data, asScore, byDraft = true, onlyPlayer = null)
//   Get results based on games w/in match(es) (resultAs = record|score)

// Both return:
//    playerId && !byDraft => [rec]
//    playerId &&  byDraft => { draftId: [rec], ... }
//   !playerId && !byDraft => { playerId: { draftId:  [rec], ... }, ... }
//   !playerId &&  byDraft => { draftId:  { playerId: [rec], ... }, ... }

// Calculated:
//   matchData = [{id, round, players[], playerids[], playerwins[], draws},...]
//   draftData = {draftid, draft, roundactive, bestof}
//   usePlayerIds = [UUID, ... ]
function getRecord(
    { draftId, playerId } = {},
    { asScore = false, ofGames = false, sortByDraft = true } = {}
) {
    // Get recordFunction (of Games or Matches)
    const recordFunc = ofGames ? toGameResults : toMatchResults;

    // All records: { playerId: Points || [wins, losses, draws], ... }
    if (!draftId && !playerId) {
        throw new Error("Cannot retrieve all records, choose draft and/or player");
    
    // All records from a draft: { playerId: Points || [wins, losses, draws], ... }
    } else if (!playerId) {
        return ops.query(
            "SELECT * FROM draftPlayer "+
            "WHERE draftId = $1;",
            [draftId]
        );
        // .then(res => recordFunc(res, asScore, byDraft));

    // All records for a player: Points || [wins, losses, draws]
    } else if (!draftId) {
        return ops.query(
            "SELECT * FROM draftPlayer "+
            "WHERE playerId = $1;",
            [playerId]
        );
        // .then(res => recordFunc(res.matches, asScore, byDraft, res.playerIds));
    }
    
    // Get draft record for one player: Points || [wins, losses, draws]
    return ops.query(
        "SELECT * FROM draftPlayer "+
        "WHERE draftId = $1 "+
        "AND playerId = $2;",
        [draftId, playerId]
    );
    // .then(res => recordFunc(res.matches, asScore, byDraft, res.playerIds));
}

// GetBreakers data based on matches (From a single draft)
// playerIds should be list of all tied players (Or just [one playerId] for their breakers data)
//   function getBreakers(draftData, playerIds) =>
//     { playerId[players] : { (match|game)Points: #, (match|game)Percent: %, opp(Match|Game)Percent: %,  }, ...
//       ..., winner: playerId }



async function getBreakers(draftId = null, playerIds = null) {
    // if (playerIds && !Array.isArray(playerIds)) playerIds = [playerIds];

    // Build base query
    let qry = "";
    let args;
    if (draftId && playerIds) {
        qry = " WHERE draftId = $1 AND playerId = ANY($2)";
        args = [draftId, playerIds];
    } else if (draftId) {
        qry = " WHERE draftId = $1";
        args = [draftId];
    } else if (playerIds) {
        qry = " WHERE playerId = ANY($1)";
        args = [playerIds];
    }
    
    // Get additional opponents
    if (playerIds) {
        qry += (
            "; " + breakerBase +
            qry.replace(
                /ANY\(\$\d\)/,
                "ANY(" + breakerOpps + qry +
                ` AND NOT (oid = ANY($${draftId ? '2' : '1'})))`
            )
        );
    }

    // Access DB
    const data = await ops.query(breakerBase + qry + ";", args)
        .then(r => playerIds ? r : [r]);
    
    // Convert to breakers
    // console.debug('RAW BREAKERS:',data[0]);
    return toBreakers(data);
}



// Report win/loss/draw for a given match
//  Report as { players: {playerId: winCount, ...} , draws: drawCount }
function report(matchId, results) {
    return ops.query(
        "UPDATE match SET (draws, players, reported) = "+
            "($1, ($2), TRUE) WHERE id = $3 RETURNING draftId;",
        [results[drawKey] || 0, results[resultsKey] || {}, matchId]
    ).then(r => r && r.draftid && {id: r.draftid});
}

// Clear reporting for match (Reset wins/draws and mark as NOT DONE)
function unreport(matchId) {
    return ops.query(
        "UPDATE match SET (draws, players, reported) = (0, p.w, FALSE) "+
            "FROM (SELECT jsonb_object_agg(pl::STRING, 0) w "+
                "FROM match, jsonb_object_keys(players) pl "+
                "WHERE id = $1 GROUP BY id) p "+
        "WHERE id = $1 RETURNING draftId;",
        [matchId]
    ).then(r => r && r.draftid && {id: r.draftid});
}

// Exports
module.exports = {
    report, unreport,
    getRecord, getBreakers,
    limits, validator,
}


// OLD METHODS

// function getRecord(
//     { draftId, playerId } = {},
//     { asScore = false, ofGames = false, sortByDraft = true }
// ) {
//     let qry;
//     if (!draftId && !playerId)
//         qry = "SELECT * FROM draftPlayerFull;"

//     // Get recordFunction (of Games or Matches)
//     const recordFunc = ofGames ? toGameResults : toMatchResults;

//     // All records: { playerId: Points || [wins, losses, draws], ... }
//     if (!draftId && !playerId) {
//         return new Error("Cannot retrieve all records, choose draft and/or player")
//         // return ops.operation(cl => cl.query(matchQueries.allMatches))
//         //     .then(res => recordFunc(res));
    
//     // All records from a draft: { playerId: Points || [wins, losses, draws], ... }
//     } else if (!playerId) {
//         return ops.operation(async cl => {
//             const draft = await cl.query(DRAFTD, [draftId])
//                 .then(r => r.rows[0]);
//             const matches = await cl.query(DRAFTM, [draftId])
//                 .then(r => r.rows);
//             return {matches, draft};
//         }).then(res => recordFunc(res, asScore, byDraft));

//     // All records for a player: Points || [wins, losses, draws]
//     } else if (!draftId) {
//         return ops.operation(async cl => {
//             const playerIds = await cl.query(TEAM, [playerId])
//                 .then(r => r.rows[0].teamlist.concat(playerId));
//             const matches = cl.query(PLAY, [playerIds]).then(r=>r.rows);
//             return {matches, playerIds};
//         }).then(res => recordFunc(res.matches, asScore, byDraft, res.playerIds));
//     }
    
//     // Get draft record for one player: Points || [wins, losses, draws]
//     return ops.operation(async cl => {
//         const playerIds = await cl.query(TEAM, [playerId])
//         .then(r => r.rows[0].teamlist.concat(playerId));
//         const matches = cl.query(DRAFTP, [draftId, playerIds]).then(r=>r.rows);
//         return {matches, playerIds};
//     }).then(res => recordFunc(res.matches, asScore, byDraft, res.playerIds));
// }
// 
// function getBreakers(draftId, playerIds) {
//     // All records from a draft: { playerId: Points || [wins, losses, draws], ... }
//     return ops.operation(async cl => {
//         const bestOf = await cl.query(DRAFTBO, [draftId])
//             .then(r => r.rows[0].bestof);
//         const matches = await cl.query(DRAFTM, [draftId])
//             .then(r => r.rows);
//         return {matches, bestOf};
//     }).then(({matches, bestOf}) => toBreakers(matches, bestOf, playerIds));
// }