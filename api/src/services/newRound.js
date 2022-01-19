const roundMatchups = require('./matchups');
const toBreakers = require('./toBreakers');
const { mapObjArr, staticValObj } = require('../utils/utils');

const autoReportByes = true;

// Builds queries for creating a round
function newRound({ draftData, drops, breakers }) {
    // Error check
    if (
        !draftData.players ||
        !draftData.players.length ||
        (drops && drops.length >= draftData.players.length)
    )
        throw new Error("No active players are registered");

    if (draftData.roundactive > draftData.roundcount)
        throw new Error("Draft is over");

    if (draftData.roundactive && !draftData.canadvance)
        throw new Error("All matches have not been reported");
    
    
    // Increment round number & create return object
    const matchBase = { 
        round: draftData.roundactive + 1,
        draftId: draftData.id,
    };

    // Determine if draft has ended
    if (draftData.roundactive === draftData.roundcount) return matchBase;

    // Format player info 
    const ranking = draftData.roundactive ?
        toBreakers([breakers], draftData.players).ranking :
        draftData.players || [];

    const oppData = draftData.roundactive &&
        mapObjArr(breakers, 'playerid', 'oppids');

    // Get match table
    const matchTable = roundMatchups(
        ranking,
        draftData.playerspermatch,
        draftData.byes,
        drops, oppData
    );

    // Auto-report byes
    const byeWins = autoReportByes ? Math.ceil((draftData.bestof + 1) / 2) : 0;
    
    // Create array of matches
    return {
        ...matchBase,

        matches: matchTable.map(match => ({
            ...matchBase,
            players: staticValObj(match, match.length === 1 ? byeWins : 0),
            reported: autoReportByes && match.length === 1,
        }))
    };
}

module.exports = newRound;