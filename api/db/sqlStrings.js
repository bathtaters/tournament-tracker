// SQL Constants
const RawPG = require('./admin/RawPG');

exports.clock = {
    modPause: RawPG("(now() - (SELECT clockstart FROM draft WHERE id = $1))")
}

exports.draft = {
    byDraftId: "WHERE draftId = $1",
    // Array layout is [ get(id), get(*) ]
    schedule: [
        "SELECT array_agg(id) drafts FROM draft@date_idx WHERE day = $1 GROUP BY day;",
        "SELECT COALESCE(to_char(day), 'none') as day, array_agg(id) as drafts FROM draft@date_idx GROUP BY day;",
    ],
    getByDay: [
        "SELECT * FROM draft WHERE day = $1;",
        "SELECT * FROM draft ORDER BY INDEX draft@date_idx;",
    ],
    maxRound: "SELECT round FROM match WHERE draftId = $1 ORDER BY round DESC LIMIT 1;",
    deleteRound: "DELETE FROM match WHERE draftId = $1 AND round = $2;",
    breakers: "SELECT breakers.*, oppIds FROM breakers LEFT JOIN draftOpps USING(draftId, playerId) ",
    reportByes:
        "UPDATE match SET (draws, players, reported) = (0, p.w, TRUE) "+
            "FROM (SELECT jsonb_object_agg(pl::STRING, $3::SMALLINT) w "+
            "FROM match m, jsonb_object_keys(m.players) pl WHERE draftId = $1 "+
                "AND (SELECT COUNT(*) FROM jsonb_object_keys(players)) = 1 GROUP BY m.id) p "+
        "WHERE draftId = $1 AND round = $2 AND (SELECT COUNT(*) FROM jsonb_object_keys(players)) = 1;",
}

exports.player = {
    pop: "UPDATE match SET players = players - $1 WHERE id = $2 RETURNING draftId;",
    swap: "UPDATE match SET players = " +
            "players - $1::STRING || jsonb_build_object($2::STRING, (players->>$1)::SMALLINT) "+
        "WHERE id = $3 RETURNING draftId;",
    draftDetails: "SELECT id, day, title FROM draft WHERE $1::UUID = ANY (players); "+
        "SELECT id, matches, day, isDrop, wins, draws, count, title, day, roundActive, roundCount "+
            "FROM draftPlayer JOIN draft ON draftId = id WHERE playerId = $1 ORDER BY day DESC;",
}

exports.match = {
    detail: "match JOIN matchDetail USING (id)",
    list: "SELECT round, array_agg(id) matches FROM match WHERE draftId = $1 GROUP BY round;",
}

exports.settings = {
    batch: "UPSERT INTO settings (id, value, type) VALUES ",
}