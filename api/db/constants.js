// Clock status
exports.clockStates = [
    'Ended',    // Has reached 0
    'Running',  // Ticking down
    'Off',      // Turned off
    'Paused',   // Held
];

// Game/Match Points
exports.points = { win: 3, draw: 1, floor: 0.33 };

// Record fields
exports.recordFields = [ 'Wins', 'Losses', 'Draws' ];

// Resused match queries
exports.matchQueries = {
    allMatches:
        "SELECT match.*, draft.* " +
        "FROM match LEFT JOIN draft ON match.draft = draft.id;",
    draft: "SELECT players, winner FROM match WHERE draft = $1",
    teamSize: "SELECT teamSize FROM draft WHERE id = $1 LIMIT 1;",
    popQuery: "UPDATE match SET players = " +
        "players - $1 WHERE id = $2;",
    swapQuery: "UPDATE match SET players = " +
        "players - $1::STRING || jsonb_build_object($2::STRING, (players->>$1)::SMALLINT) WHERE id = $3;",
        // "array_replace(players, ($2)::UUID, ($1)::UUID) WHERE id = $4;",
    currentRound: "SELECT round FROM match@draft_idx WHERE draftId = $1 "+
        "ORDER BY round DESC LIMIT 1;",
}

exports.teamQueries = {
    addMember:  "UPDATE player SET members = members || $1 WHERE isTeam = TRUE AND id = $2;",
    rmvMember:  "UPDATE player SET members = array_remove(members, $1) WHERE isTeam = TRUE AND id = $2;",
    replMember: "UPDATE player SET members = array_replace(members, $1, $2) WHERE isTeam = TRUE AND id = $3;",
    replMember2: " UPDATE player SET members = array_replace(members, $2, $1) WHERE isTeam = TRUE AND id = $4;",
}

exports.resultQueries = {
    breakerBase: "SELECT * FROM breakers",
    breakerOpps: "SELECT DISTINCT oid FROM breakers, unnest(oppIds) oid",
}