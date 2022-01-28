// SQL Constants
const RawPG = require('../admin/RawPG');

exports.clock = {
    modPause: RawPG("(now() - (SELECT clockstart FROM event WHERE id = $1))"),
}

exports.event = {
    byEventId: "WHERE eventId = $1",
    maxRound: "SELECT round FROM match WHERE eventId = $1 ORDER BY round DESC LIMIT 1;",
    deleteRound: "DELETE FROM match WHERE eventId = $1 AND round = $2;",
    complete: "LEFT JOIN event ON event.id = eventId WHERE event.roundActive > event.roundCount",
}

exports.player = {
    eventFilter: 'WHERE $1::UUID = ANY(players)',
}

exports.match = {
    list: "SELECT round, array_agg(id) matches FROM match WHERE eventId = $1 GROUP BY round;",
    setPlayer: "UPDATE match SET players = players || $2 where id = $1 RETURNING eventid;",
    complete: exports.event.complete,
}