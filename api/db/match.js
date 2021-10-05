/* *** MATCH Object *** */

// Imports
const ops = require('./admin/base');
// const { playerArr, matchResult, toRecord } = require('../services/dbTranslate');
const { matchQueries } = require('./constants');
const roundMatchups = require('../services/matchups');
const { toBreakers } = require('../services/dbResults');
const { mapObjArr } = require('../services/utils');

// Basic settings
const maxRounds = require('./draft').limits.roundCount;
const limits = {
    players: { min: 1, max: 10 },
    winsDrawsMin: 0,
    roundMin: 1,
};
const defBestOf = 3;

// Advanced validation
const { body, param } = require('express-validator');
const { validateArray, sanitizeArray } = require('../services/utils');
const { isUUID } = require('validator').default;
const validator = (maxRounds = maxRounds) => [
    param('matchId').isUUID(4),
    body('draftId').isUUID(4),
    body('round').isInt({min: limits.roundMin, max:maxRounds})
        .bail().toInt(),
    body('players')
        .custom(validateArray(limits.players, m => isUUID(m,4)))
        .customSanitizer(sanitizeArray()),
    body('wins').isInt({min: limits.winsDrawsMin, max:maxRounds})
        .bail().toInt(),
    body('draws').isInt({min: limits.winsDrawsMin, max:maxRounds})
        .bail().toInt(),
];

// Match Ops
function get(matchId, detail = true) {
    return ops.query(
        "SELECT * FROM match "+
        (detail ? "JOIN matchDetail USING (id) " : "")+
        "WHERE id = $1;",
        [matchId]
    );
}

function list(draftId, round = null) {
    return round

    ? ops.query(
        "SELECT json_object_agg(id::STRING, reported::STRING) m "+
        "FROM match WHERE draftId = $1 AND round = $2 GROUP BY round;",
        [draftId, round]
    ).then(r => r && r.m || r[0].m)
    // ).then(r => r && r.map(m => ({ [m.id]: m.reported })))

    : ops.query(
        "SELECT round, json_object_agg(id::STRING, reported::STRING) m "+
        "FROM match WHERE draftId = $1 GROUP BY round;",
        [draftId]
    ).then(r => r && r.reduce((res,next) => {
        res[next.round - 1] = next.m;
        return res;
    }, []));
    // ).then(r => r && r.reduce((res,m) => {
    //     if (!res[m.round||0]) res[m.round||0] = [];
    //     res[m.round||0].push(({ [m.id]: m.reported }));
    //     return res;
    // }, []));
}

function listDetail(draftId, round = null) {
    return round 
    ? ops.query(
        "SELECT * FROM match JOIN matchDetail USING (id) "+
        "WHERE draftId = $1 AND round = $2;",
        [draftId, round]
    )
    : ops.query(
        "SELECT * FROM match JOIN matchDetail USING (id) "+
        "WHERE draftId = $1 ORDER BY round;",
        [draftId]
    );
}


// Append a new round to a draft
function pushRound(draftId) {
    return ops.operation(async cl => {
        const draftData = await cl.query(
            "SELECT * FROM draftDetails WHERE id = $1;", [draftId]
        ).then(r => r && r.rows && r.rows[0]);

        // Error check
        if (!draftData) throw Error("Invalid draft Id or error connecting.");
        if (!draftData.players || !draftData.players.length)
            return {error: "No active players are registered."};
        if (draftData.roundactive > draftData.roundcount)
            return {error: "Draft is over."};
        if (draftData.roundactive && !draftData.canadvance)
            return {error: "All matches have not been reported."};

        const nextRound = draftData.roundactive + 1;
        if (draftData.roundactive === draftData.roundcount && draftData.canadvance) {
            // draft is finished
            await cl.query(
                "UPDATE draft SET roundActive = $1 WHERE id = $2;",
                [nextRound, draftId]
            );
            return {success: true};
        }

        // Append ranking info
        let oppData, rankings;
        if (draftData.roundactive) {
            const breakers = await cl.query(
                "SELECT * FROM breakers WHERE draftId = $1;", [draftId]
            ).then(r => r && r.rows);
            rankings = toBreakers([breakers]).ranking;
            oppData = mapObjArr(breakers,'playerid','oppids');
        }

        // Build match table
        const matchTable = roundMatchups(draftData, oppData, rankings);
        
        // Create matches
        let qry = "INSERT INTO match(draftId, round, players) VALUES";
        let args = [draftId, nextRound];
        for (const match of matchTable) {
            args.push(Object.fromEntries(match.map(id=>[id,0])));
            qry += ` ($1, $2, ($${args.length})),`;
        }
        await cl.query(qry.replace(/,$/,';'), args);

        // Increment round number
        await cl.query(
            "UPDATE draft SET roundActive = $1 WHERE id = $2;",
            [nextRound, draftId]
        );

        // Auto-report byes
        const wins = Math.ceil(((draftData.bestof||defBestOf) + 1) / 2);
        await cl.query(
            "UPDATE match SET (draws, players, reported) = (0, p.w, TRUE) "+
                "FROM (SELECT jsonb_object_agg(pl::STRING, $3::SMALLINT) w "+
                    "FROM match m, jsonb_object_keys(m.players) pl "+
                    "WHERE draftId = $1 "+
                    "AND (SELECT COUNT(*) FROM jsonb_object_keys(players)) = 1 "+
                    "GROUP BY m.id) p "+
            "WHERE draftId = $1 AND round = $2 "+
            "AND (SELECT COUNT(*) FROM jsonb_object_keys(players)) = 1;",
            [draftId, nextRound, wins]
        );

        await cl.query(
            "SELECT * FROM match JOIN matchDetail USING (id) "+
            "WHERE draftId = $1 AND round = $2;",
            [draftId, nextRound]
        ).then(r => console.log(r.rows));

        return {success: true, round: draftData.roundactive + 1};
    });
}

function autoReportByes(draftId, round) {
    return ops.operation(async cl => {
        const wins = cl.query("SELECT bestOf FROM draft WHERE id = $1;",[draftId])
            .then(r => Math.ceil((r.bestof+1)/2));
        return cl.query(
            "UPDATE match SET (draws, players, reported) = (0, p.w, TRUE) "+
                "FROM (SELECT jsonb_object_agg(pl::STRING, $3) w "+
                    "FROM match, jsonb_object_keys(players) pl "+
                    "WHERE draftId = $1 GROUP BY match.id) p "+
            "WHERE draftId = $1 AND round = $2 AND reported = FALSE;",
            [draftId, round, wins]
        );
    })
}

// Remove the last round from a draft
function popRound(draftId, round = null) {
    return ops.operation(async cl => {
        if (!round) round = await cl.query(matchQueries.currentRound,[draftId])
            .then(r => r && r.rows[0] ? r.rows[0].round : null);
        if (round === null) return new Error("No rounds in this draft to delete.");
        await cl.query(
            "DELETE FROM match WHERE draftId = $1 AND round = $2 RETURNING id;",
            [draftId, round]
        );
        return cl.query(
            "UPDATE draft SET roundActive = $1 WHERE id = $2;",
            [round - 1, draftId]
        );
    });
}

// Exports
module.exports = {
    list, listDetail, get, 
    pushRound, popRound,
    limits, validator,

    // Direct access
    // more: { getRaw: id => ops.getRow('match', id), set: (id, setFields) => ops.updateRow('match', id, setFields) }
}
