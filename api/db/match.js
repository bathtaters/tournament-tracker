/* *** MATCH Object *** */

// Imports
const ops = require('./admin/base');
// const { playerArr, matchResult, toRecord } = require('../services/dbTranslate');
const { matchQueries } = require('./constants');
const roundMatchups = require('../services/utils').unflat;

// Basic settings
const limits = {
    players: { min: 1, max: 10 },
    round: require('./draft').limits.roundCount,
};

// Advanced validation
const { body, param } = require('express-validator');
const { validateArray, sanitizeArray } = require('../services/utils');
const { isUUID } = require('validator').default;
const validator = () => [
    param('matchId').isUUID(4),
    body('draftId').isUUID(4),
    body('round').isInt(limits.round).bail().toInt(),
    body('players')
        .custom(validateArray(limits.players, m => isUUID(m,4)))
        .customSanitizer(sanitizeArray()),
];

// Match Ops

// Get match info
function get(matchId, joined = false) {
    return joined ? ops.accessDb(async cl => 
        cl.query(matchQueries.matchJoin, [matchId])
        // // Get basic info
        // const match = await cl.query(
        //     "SELECT * FROM match WHERE id = $1;", [id]
        // ).then(r => r.rows[0]);
        // const teamSize = await cl.query(
        //     "SELECT teamSize FROM draft WHERE id = $1", [match.draft]
        // ).then(r => r.rows[0].teamsize);

        // // Get Player data
        // if (joined && match.players.length) {
        //     let playerData = await cl.query(
        //         "SELECT * FROM player WHERE id = ANY ($1);", [match.players]
        //     ).then(r => r.rows);

        //     // Join
        //     match.players = match.players.map(p => 
        //         playerData.find(d => d.id === p) || {id: p}
        //     );
        // }

        // // Clean up values
        // return {rows: match};
    ) : ops.getRow('match', matchId);
}

// List all matches (in draft (in round)).
function list(draftId, round) {
    // Get all matches
    if (!draftId) {
        return ops.accessDb(cl => cl.query("SELECT * FROM match ORDER BY INDEX match@draft_idx;"));
    }

    // Get all matches in a draft
    if (!round) {
        const getDraft = "SELECT * FROM match WHERE draft = $1 ORDER BY INDEX match@draft_idx;";
        return ops.accessDb(cl => cl.query(getDraft, [draftId]));
    }

    // Get matches from a draft round
    return ops.accessDb(cl => cl.query(
        "SELECT * FROM match@draft_idx WHERE draft = $1 AND round = $2;",
        [draftId, round]
    ));
}

// Append a new round to a draft
function pushRound(draftId) {
    return ops.accessDb(async cl => {
        const round = await cl.query(
            "SELECT round FROM match@draft_idx WHERE draft = $1 ORDER BY round DESC LIMIT 1;",
            [draftId]
        ).then(r => r && r.rows[0] ? r.rows[0].round + 1 : 1);
        const players = await cl.query(
            "SELECT players FROM draft WHERE id = $1;",
            [draftId]
        ).then(r => r && r.rows[0] ? r.rows[0].players : []);

        const matchTable = roundMatchups(players, 2); // TO FIX

        for (const match of matchTable) {
            await cl.query(
                "INSERT INTO match(draft, round, players, wins) VALUES($1, $2, ($3));",
                [draftId, round, match, match.map(()=>0)]
            );
        }
        return {rows:round};
    });
}

// Remove the last round from a draft
function popRound(draftId) {
    const round = await cl.query(
        "SELECT round FROM match@draft_idx WHERE draft = $1 ORDER BY round DESC LIMIT 1;",
        [draftId]
    ).then(r => r && r.rows[0] ? r.rows[0].round : null);
    if (round === null) return new Error("No rounds exist in this draft to delete.");
    return ops.accessDb(cl => cl.query(
        "DELETE FROM match@draft_idx WHERE draft = $1 AND round = $2;",
        [draftId, round]
    ));
}

// Exports
module.exports = {
    list, get,
    pushRound, popRound,

    limits, validator,

    // Direct access
    // more: { getRaw: id => ops.getRow('match', id), set: (id, setFields) => ops.updateRow('match', id, setFields) }
}
