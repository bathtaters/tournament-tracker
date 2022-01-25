// SQL Constants
const RawPG = require('../admin/RawPG');

exports.clock = {
    modPause: RawPG("(now() - (SELECT clockstart FROM draft WHERE id = $1))"),
}

exports.draft = {
    byDraftId: "WHERE draftId = $1",
    maxRound: "SELECT round FROM match WHERE draftId = $1 ORDER BY round DESC LIMIT 1;",
    deleteRound: "DELETE FROM match WHERE draftId = $1 AND round = $2;",
    complete: "LEFT JOIN draft ON draft.id = draftId WHERE draft.roundActive > draft.roundCount",
}

exports.player = {
    draftFilter: 'WHERE $1::UUID = ANY(players)',
}

exports.match = {
    list: "SELECT round, array_agg(id) matches FROM match WHERE draftId = $1 GROUP BY round;",
    setPlayer: "UPDATE match SET players = players || $2 where id = $1 RETURNING draftid;",
    complete: exports.draft.complete,
}