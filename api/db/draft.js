/* *** DRAFT Object *** */

// Imports
const { matchQueries } = require('./constants');
const roundMatchups = require('../services/matchups');
const { toBreakers } = require('../services/dbResults');
const { mapObjArr } = require('../services/utils');

// Basic settings
const defVal = {
    title: null, day: null,
    players: [], bestOf: 3,
    playersPerMatch: 2,
    roundCount: 3, clockLimit: 3600,
};
const limits = {
    title: {min: 0, max: 50},
    bestOf: {min: 1, max: 7},
    playersPerMatch: {min: 2, max: 8},
    roundCount: {min: 1, max: 10},
    clockLimit: {min: 1, max: 24*60*60},
};

// Advanced validation
const { body, param } = require('express-validator');
const validator = () => [
    param('draftId').isUUID(4),
    body('title').optional().isAscii().bail().stripLow().isLength(limits.title).escape(),
    body('day').optional().isDate().bail().toDate(),
    body('bestOf').optional().isInt(limits.bestOf).bail().toInt(),
    body('playersPerMatch').optional().isInt(limits.playersPerMatch).bail().toInt(),
    body('roundCount').optional().isInt(limits.roundCount).bail().toInt(),
    body('clockLimit').optional().isInt(limits.clockLimit).bail().toInt(),
];

// Draft Ops
const ops = require('./admin/basicAccess');

function getByDay(date) {
    return ops.query(date ?
        // id, day, title, roundActive, roundCount
        "SELECT array_agg(id) drafts FROM draft@date_idx WHERE day = $1 GROUP BY day;" :
        "SELECT json_object_agg(k,v) FROM (SELECT COALESCE(to_char(day), 'none') as k, array_agg(id) as v FROM draft@date_idx GROUP BY day);",
        date ? [date] : []
    ).then(r => !r || date ? r : r.json_object_agg);
}

function list(date) {
    return ops.query(date ?
        // id, day, title, roundActive, roundCount
        "SELECT * FROM draft@date_idx WHERE day = $1;" :
        "SELECT * FROM draft ORDER BY INDEX draft@date_idx;",
        date ? [date] : []
    );
}

const add = ({ 
    title = defVal.title,
    day = defVal.day,
    roundcount = defVal.roundCount,
    bestof = defVal.bestOf,
    playerspermatch = defVal.playersPerMatch,
    clocklimit = defVal.clockLimit,
    players = defVal.players,
}) => ops.query(
    "INSERT INTO draft("+
        "title, day, roundCount, bestOf, "+
        "playersPerMatch, clockLimit, players"+
    ") VALUES($1, $2, $3, $4, $5, $6, ($7)::UUID[]) RETURNING id;",
    [
        title, day, roundcount, bestof,
        playerspermatch, clocklimit, players,
    ]
);


// Append a new round to a draft
function pushRound(draftId) {
    return ops.operation(async cl => {
        const draftData = await cl.query(
            "SELECT * FROM draftReport WHERE id = $1;", [draftId]
        ).then(r => r && r.rows && r.rows[0]);

        const drops = await cl.query(
            "SELECT drops FROM draftDrops WHERE id = $1;", [draftId]
        ).then(r => r && r.rows && r.rows[0] && r.rows[0].drops);

        // Error check
        if (!draftData) throw Error("Invalid draft Id or error connecting.");
        if (!draftData.players || !draftData.players.length || (drops && drops.length >= draftData.players.length))
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
        const matchTable = roundMatchups(draftData, drops, oppData, rankings);
        
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
        const wins = Math.ceil(((draftData.bestof||defVal.bestOf) + 1) / 2);
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

        return { id: draftId };
    });
}

// Remove the last round from a draft
function popRound(draftId, round = null) {
    return ops.operation(async cl => {
        if (!round) round = await cl.query(matchQueries.currentRound,[draftId])
            .then(r => r && r.rows[0] ? r.rows[0].round : null);
        if (round === null) return new Error("No rounds in this draft to delete.");
        await cl.query(
            "DELETE FROM match WHERE draftId = $1 AND round = $2;",
            [draftId, round]
        );
        return cl.query(
            "UPDATE draft SET roundActive = $1 WHERE id = $2 RETURNING id;",
            [round - 1, draftId]
        );
    });
}


// Exports
module.exports = {
    list, getByDay, add,
    pushRound, popRound, 
    // addPlayer, rmvPlayer, swapPlayer,
    get: id => ops.getRow('draft', id),
    getDetail: id => ops.getRow('draftDetail', id),
    getDrops: id => ops.getRow('draftDrops', id).then(r => (r && r.drops) || []),
    rmv:  id => ops.rmvRow('draft', id),
    set: (id, newParams) => ops.updateRow('draft', id, newParams),
    limits, validator,
}