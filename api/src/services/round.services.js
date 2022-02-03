// Services
const matchGen = require('./matchGenerators/swissMonrad');
const toStats = require('./stats.services');

// Builds data object representing a round
function round(eventData, matchData, oppData, autoReportByes) {
    // Increment round number & create return object
    const matchBase = { 
        round: Math.min(eventData.roundactive, eventData.roundcount) + 1,
        eventid: eventData.id,
    };

    // Event has ended
    if (matchBase.round == eventData.roundcount + 1) return matchBase;

    // Collect data for match generator
    let playerList = eventData.roundactive ?
        toStats({ solo: matchData }, eventData.players, { solo: oppData }, true).ranking :
        eventData.players;
    if (!playerList) playerList = [];
    if (eventData.drops) playerList = playerList.filter(p => !eventData.drops.includes(p));

    // Generate match table (Can add more alogrithms later)
    const matchTable = matchGen(playerList, {...eventData, oppData});

    // Format for DB write (auto-reporting byes)
    const byeWins = autoReportByes ? eventData.wincount : 0;
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