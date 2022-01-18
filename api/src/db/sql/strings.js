// SQL Constants
const RawPG = require('../admin/RawPG');

exports.clock = {
    modPause: RawPG("(now() - (SELECT clockstart FROM draft WHERE id = $1))"),
}

exports.draft = {
    byDraftId: "WHERE draftId = $1",
    schedule: "SELECT COALESCE(to_char(day), 'none') as day, array_agg(id) as drafts "+
        "FROM draft@date_idx GROUP BY day;",
    getByDay: [
        // [ 0: get a day, 1: get all drafts ]
        "SELECT * FROM draft WHERE day = $1;",
        "SELECT * FROM draft ORDER BY INDEX draft@date_idx;",
    ],
    maxRound: "SELECT round FROM match WHERE draftId = $1 ORDER BY round DESC LIMIT 1;",
    deleteRound: "DELETE FROM match WHERE draftId = $1 AND round = $2;",
    breakers: "SELECT breakers.*, oppIds FROM breakers LEFT JOIN draftOpps USING(draftId, playerId) ",
}

exports.player = {
    pop: "UPDATE match SET players = players - $1::STRING WHERE id = $2 RETURNING draftId;",
    swap: "UPDATE match SET players = " +
            "players - $1::STRING || jsonb_build_object($2::STRING, (players->>$1)::SMALLINT) "+
        "WHERE id = $3 RETURNING draftId;",
    draftJoin: 'JOIN draft ON draftId = id WHERE playerId = $1 ORDER BY day DESC',
    draftCols: 'id, title, day, isDrop, wins, draws, count, roundActive, roundCount',
    draftFilter: 'WHERE $1::UUID = ANY(players)',
}

exports.match = {
    detail: "match JOIN matchDetail USING (id)",
    list: "SELECT round, array_agg(id) matches FROM match WHERE draftId = $1 GROUP BY round;",
    setPlayer: "UPDATE match SET players = players || $2 where id = $1 RETURNING draftid;",
}