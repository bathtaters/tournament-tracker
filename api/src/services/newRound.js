const roundMatchups = require('./matchups');
const { toBreakers } = require('./results');
const { mapObjArr, staticValObj } = require('../helpers/utils');

const autoReportByes = true;

// Builds queries for creating a round
function newRound({ draftData, drops, breakers }) {
    // Error check
    if (
        !draftData.players ||
        !draftData.players.length ||
        (drops && drops.length >= draftData.players.length)
    )
        throw new Error("No active players are registered.");

    if (draftData.roundactive > draftData.roundcount)
        throw new Error("Draft is over.");

    if (draftData.roundactive && !draftData.canadvance)
        throw new Error("All matches have not been reported.");
    
    
    // Increment round number
    const nextRound = draftData.roundactive + 1;
    let queries = [
        ["UPDATE draft SET roundActive = $1 WHERE id = $2;"],
        [[nextRound, draftData.id]]
    ]

    // Determine if draft has ended
    if (draftData.roundactive === draftData.roundcount) return queries;

    // Get ranking info
    let oppData, rankings;
    if (draftData.roundactive) {
        rankings = toBreakers([breakers]).ranking;
        oppData = mapObjArr(breakers,'playerid','oppids');
    }

    // Build match table
    const matchTable = roundMatchups(draftData, drops, oppData, rankings);

    // Auto-report byes
    const byeWins = autoReportByes ? Math.ceil((draftData.bestof + 1) / 2) : 0;
    
    // Create matches
    let qry = "INSERT INTO match(draftId, round, players) VALUES";
    let args = [draftData.id, nextRound];
    for (const match of matchTable) {
        args.push(staticValObj(match, match.length === 1 ? byeWins : 0));
        qry += ` ($1, $2, ($${args.length})),`;
    }
    queries[0].push(qry.replace(/,$/,';'));
    queries[1].push(args);

    return queries;
}

module.exports = newRound;