// Services
const matchGen = require('./matchGenerators/swissMonrad');
const toStats = require('./stats.services');

// Builds data object representing a round
function round(draftData, matchData, oppData, autoReportByes) {
    // Increment round number & create return object
    const matchBase = { 
        round: Math.min(draftData.roundactive, draftData.roundcount) + 1,
        draftId: draftData.id,
    };

    // Draft has ended
    if (matchBase.round == draftData.roundcount + 1) return matchBase;

    // Collect data for match generator
    let playerList = draftData.roundactive ?
        toStats({ solo: matchData }, draftData.players, { solo: oppData }, true).ranking :
        draftData.players;
    if (!playerList) playerList = [];
    if (draftData.drops) playerList = playerList.filter(p => !draftData.drops.includes(p));

    // Generate match table (Can add more alogrithms later)
    const matchTable = matchGen(playerList, {...draftData, oppData});

    // Format for DB write (auto-reporting byes)
    const byeWins = autoReportByes ? draftData.wincount : 0;
    return {
        ...matchBase,

        matches: matchTable.map(match => ({
            ...matchBase,
            players: match,
            wins: match.map(() => match.length === 1 ? byeWins : 0),
            reported: autoReportByes && match.length === 1,
        }))
    };
}

module.exports = round;