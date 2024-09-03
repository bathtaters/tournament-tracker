// SQL Constants
const RawPG = require('../admin/RawPG');

exports.clock = {
    modPause: RawPG("(now() - (SELECT clockstart FROM event WHERE id = $1))"),
}

exports.event = {
    byEventId: "WHERE eventid = $1",
    maxSlot: ['SELECT slot FROM event@date_idx WHERE ', ' ORDER BY slot DESC LIMIT 1;'],
    maxRound: "SELECT round FROM match WHERE eventid = $1 ORDER BY round DESC LIMIT 1;",
    deleteRound: "WHERE eventid = $1 AND round = $2",
    complete: "LEFT JOIN event ON event.id = eventid WHERE event.roundactive > event.roundcount",
    plan: "UPDATE event SET plan = NOT(plan) WHERE plan = NOT(id = ANY($1)) RETURNING *;",
    schedule: {
        prefix: "SELECT COALESCE(TO_CHAR(day), 'none') as day, JSON_OBJECT_AGG(id::STRING, slot) as eventslots FROM event@date_idx ",
        useSettings: "WHERE NOT plan OR (SELECT value FROM settings WHERE id = 'planschedule') = 'true' ",
        planOnly: "WHERE plan ",
        suffix: "GROUP BY day;",
    },
}

exports.player = {
    eventFilter: "SELECT id FROM event WHERE $1::UUID = ANY(players) ORDER BY day ASC;",
}

exports.match = {
    list: "SELECT round, array_agg(id) matches FROM match WHERE eventid = $1 GROUP BY round;",
    drop:   "UPDATE match SET drops = ARRAY_APPEND(drops, $2) WHERE id = $1 RETURNING *;",
    undrop: "UPDATE match SET drops = ARRAY_REMOVE(drops, $2) WHERE id = $1 RETURNING *;",
    complete: exports.event.complete,
    allCounts: `
    WITH unnested AS (SELECT id, unnest(players) AS player FROM match WHERE eventid <> $1)
    SELECT
        player1 AS id,
        player2 AS opp,
        COUNT(*) AS count
    FROM (
        SELECT a.player AS player1, b.player AS player2
        FROM unnested a
        JOIN unnested b ON a.id = b.id
        WHERE a.player <> b.player
    )
    GROUP BY player1, player2;`
}

exports.voter = {
    add: "INSERT INTO voter (id) SELECT id FROM player WHERE id = ANY($1) ON CONFLICT DO NOTHING RETURNING *;",
    rmv: "DELETE FROM voter WHERE NOT(id = ANY($1)) RETURNING *;",
}

exports.plan = {
    reset: [
        "DELETE FROM voter;",
        "UPDATE event SET plan = FALSE;",
        "DELETE FROM settings WHERE id = 'plandates' OR id = 'planslots';",
    ],
}