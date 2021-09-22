/* *** MATCH RESULTS Sub-Object *** */

// Imports
const ops = require('./admin/base');
const { playerArr, matchResult, toRecord } = require('../services/dbTranslate');
const { matchQueries } = require('./constants');
const { mapObjArr } = require('../services/utils');

const drawKey = 'draws';
const draftLims = require('./draft').limits;
const limits = {
    results: {min: 0, max: draftLims.bestOf },
};

// Advanced validation
const { body, param } = require('express-validator');
const validator = () => [
    param('matchId').isUUID(4),
    body('results').isJSON(),
];
// Results.keys should be UUIDs OR 'DRAWS', Results.vals should be ints w/ limits.results

// Get Win/Loss/Draw record for draft and/or player(s)
// draft ONLY: GET MATCH(player/team Ids/Names, record, group by ROUND) in DRAFT
// player ONLY: GET MATCH(player/team Ids (JOIN Names), record/points) +join+ DRAFT(title, roundActive, roundCount, bestOf) with PLAYER
// draft+player: GET MATCH(player/team Ids (JOIN Names), record/points) with PLAYER in DRAFT
const DRAFTD = "SELECT id draftid, title draft, roundActive, bestof FROM draft WHERE id = $1;";
const DRAFTM = "SELECT " +
        "m.id id, " +
        "m.round round, " +
        "array_agg(p.name) players, " +
        "m.players playerids, " +
        // "array_agg(p.members) memberids, " +
        // "array_agg(SELECT player.name FROM player WHERE player.id = ANY (p.members)) members, " +
        "m.wins playerwins, " +
        "m.draws draws " +
    "FROM match@draft_idx m WHERE m.draft = $1 " +
    "LEFT JOIN player p ON p.id = ANY (m.players) " +
    "GROUP BY m.id;";
const TEAM = "SELECT teamList FROM player WHERE id = $1;";
const PLAY = "SELECT " +
        "m.id id, " +
        "m.round round, " +
        "d.id draftid, " +
        "d.title draft, " +
        "d.roundActive roundActive, " +
        "d.bestOf bestof, " +
        "array_agg(p.name) players, " +
        "m.players playerids, " +
        // "array_agg(p.members) memberids, " +
        // "array_agg(SELECT player.name FROM player WHERE player.id = ANY (p.members)) members, " +
        "m.wins playerwins, " +
        "m.draws draws " +
    "FROM match m WHERE m.id = ANY " + 
    "(SELECT unnest(matchList) FROM player WHERE id = ANY ($1)) " + 
    "LEFT JOIN draft d ON m.draft = d.id " +
    "LEFT JOIN player p ON p.id = ANY (m.players) " +
    "GROUP BY m.id;";
const DRAFTP = "SELECT " +
        "m.id id, " +
        "m.round round, " +
        "d.id draftid, " +
        "d.title draft, " +
        "d.roundActive roundActive, " +
        "d.bestOf bestof, " +
        "array_agg(p.name) players, " +
        "m.players playerids, " +
        // "array_agg(p.members) memberids, " +
        // "array_agg(SELECT player.name FROM player WHERE player.id = ANY (p.members)) members, " +
        "m.wins playerwins, " +
        "m.draws draws " +
    "FROM match@draft_idx m WHERE m.draft = $1 AND m.id = ANY " + 
    "(SELECT unnest(matchList) FROM player WHERE id = ANY ($2)) " + 
    "LEFT JOIN draft d ON m.draft = d.id " +
    "LEFT JOIN player p ON p.id = ANY (m.players) " +
    "GROUP BY m.id;";
// toRecord({ matches: [matchData], draft: draftData } || [matchData + draftData], [usePlayerIds]?)
// matchData = [{id, round, players[], playerids[], playerwins[], draws},...]
// draftData = {draftid, draft, roundactive, bestof}
// usePlayerIds = [UUID, ... ]
function getRecord({ draftId, playerId } = {}, recordFunc = toRecord) {

    // All records: { playerId: Points || [wins, losses, draws], ... }
    if (!draftId && !playerId) {
        return ops.accessDb(cl => cl.query(matchQueries.allMatches))
            .then(res => recordFunc(res));
    
    // All records from a draft: { playerId: Points || [wins, losses, draws], ... }
    } else if (!playerId) {
        return ops.accessDb(async cl => {
            const draft = await cl.query(DRAFTD, [draftId])
                .then(r => r.rows[0]);
            const matches = await cl.query(DRAFTM, [draftId])
                .then(r => r.rows);
            return {rows: {matches, draft}};
        }).then(res => recordFunc(res));

    // All records for a player: Points || [wins, losses, draws]
    } else if (!draftId) {
        return ops.accessDb(async cl => {
            const playerIds = await cl.query(TEAM, [playerId])
                .then(r => r.rows[0].teamlist.concat(playerId));
            const matches = cl.query(PLAY, [playerIds]).then(r=>r.rows);
            return {rows: {matches, playerIds}};
        }).then(res => recordFunc(res.matches, res.playerIds));
    }
    
    // Get draft record for one player: Points || [wins, losses, draws]
    return ops.accessDb(async cl => {
        const playerIds = await cl.query(TEAM, [playerId])
        .then(r => r.rows[0].teamlist.concat(playerId));
        const matches = cl.query(DRAFTP, [draftId, playerIds]).then(r=>r.rows);
        return {rows: {matches, playerIds}};
    }).then(res => recordFunc(res.matches, res.playerIds));
}


// Report win/loss/draw for a given match
//  Report as { playerId: winCount, ... , draws: drawCount }
function report(matchId, results) {
    const draws = results[drawKey] || 0;
    delete results[drawKey];
    return ops.accessDb(async cl => {
        const players = await cl.query("SELECT players FROM match WHERE id = $1;", [matchId]).then(r=>r.rows);
        const wins = players.map(p => results[p] || 0);
        return cl.query(
            "UPDATE match SET (draws, wins) = ($1, ($2)::SMALLINT[]) WHERE id = $3;",
            [draws, wins, matchId]
        );
    });
}

// Exports
module.exports = {
    report, getRecord,
    limits, validator,
}