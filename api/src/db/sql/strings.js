// SQL Constants
const RawPG = require('../admin/RawPG');

exports.clock = {
    modPause: RawPG("(now() - (SELECT clockstart FROM event WHERE id = $1))"),
}

exports.event = {
    byEventId: "WHERE eventid = $1",
    maxSlot: ['SELECT slot FROM event@date_idx WHERE ', ' ORDER BY slot DESC LIMIT 1;'],
    maxRound: "SELECT round FROM match WHERE eventid = $1 ORDER BY round DESC LIMIT 1;",
    deleteRound: "DELETE FROM match WHERE eventid = $1 AND round = $2;",
    complete: "LEFT JOIN event ON event.id = eventid WHERE event.roundactive > event.roundcount",
}

exports.player = {
    eventFilter: 'WHERE $1::UUID = ANY(players) ORDER BY day ASC',
}

exports.match = {
    list: "SELECT round, array_agg(id) matches FROM match WHERE eventid = $1 GROUP BY round;",
    complete: exports.event.complete,
}