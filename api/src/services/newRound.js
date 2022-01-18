const roundMatchups = require('./matchups');
const { toBreakers } = require('./results');
const { mapObjArr, staticValObj } = require('../utils/utils');
const { incRound } = require('../db/sql/strings').draft;

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
    
    
    // Increment round number & create return object
    const retObj = { 
        round: draftData.roundactive + 1,
        draftId: draftData.id,
    };

    // Determine if draft has ended
    if (draftData.roundactive === draftData.roundcount) return retObj;

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
    
    // Create array of match.players
    retObj.matches = [];
    for (const match of matchTable) {
        retObj.matches.push(staticValObj(match, match.length === 1 ? byeWins : 0));
    }
    return retObj;
}

module.exports = newRound;