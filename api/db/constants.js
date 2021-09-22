// Clock status
exports.clockStates = [
    'ended',    // Has reached 0
    'running',  // Ticking down
    'off',      // Turned off
    'paused',   // Held
];

// Resused match queries
exports.matchQueries = {
    matchJoin:
        "SELECT " +
            "m.id id, " +
            "m.round round, " +
            "d.id draftid, " +
            "d.title draft, " +
            "d.roundActive activeround, " +
            "d.bestOf bestof, " +
            "array_agg(p.name) players, " +
            "m.players playerids, " +
            // "array_agg(p.members) memberids, " +
            // "array_agg(SELECT player.name FROM player WHERE player.id = ANY (p.members)) members, " +
            "m.wins playerwins, " +
            "m.draws draws " +
        "FROM match m WHERE m.id = $1 " +
        "LEFT JOIN draft d ON m.draft = d.id " +
        "LEFT JOIN player p ON p.id = ANY (m.players) " +
        "GROUP BY m.id;",
    allMatches:
        "SELECT match.*, draft.* " +
        "FROM match LEFT JOIN draft ON match.draft = draft.id;",
    draft: "SELECT players, winner FROM match WHERE draft = $1",
    teamSize: "SELECT teamSize FROM draft WHERE id = $1 LIMIT 1;",
    swapQuery: "UPDATE match@draft_idx SET players = " +
        "array_replace(players, ($1)::UUID, ($2)::UUID) WHERE id = $3;",
}

exports.teamQueries = {
    addTeamList:  "UPDATE player SET teamList = teamList || $1 WHERE id = ",
    rmvTeamList:  "UPDATE player SET teamList = array_remove(teamList, $1) WHERE id = ",
    replTeamList: "UPDATE player SET teamList = array_replace(teamList, $1, $2) WHERE id = ",
    addMember:  "UPDATE player SET members = members || $1 WHERE id = $2;",
    rmvMember:  "UPDATE player SET members = array_remove(members, $1) WHERE id = $2;",
    replMember: "UPDATE player SET members = array_replace(members, $1, $2) WHERE id = $3;",
}