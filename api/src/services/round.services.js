const swissMonrad = require('./matchGenerators/swissMonrad');
const toStats = require('./stats.services');
const { arrToObj } = require('../utils/shared.utils');

// HELPER: Convert array of keys into single object using 'value' as value for each key
const monoValueObj = (keys, value) => keys.reduce((obj, key) => 
    Object.assign(obj, { [key]: value }), 
    {}
);

// Builds queries for creating a round
function round(draftData, matchData, oppData, autoReportByes = true) {
    // Increment round number & create return object
    const matchBase = { 
        round: Math.min(draftData.roundactive, draftData.roundcount) + 1,
        draftId: draftData.id,
    };

    if (draftData.roundactive >= draftData.roundcount) return matchBase; // Draft has ended

    // Collect data for match generator
    let playerList = draftData.roundactive ?
        toStats({ solo: matchData }, draftData.players, { solo: oppData }, true).ranking :
        draftData.players;
    if (!playerList) playerList = [];
    if (draftData.drops) playerList = playerList.filter(p => !draftData.drops.includes(p));

    // Generate match table (Can add more alogrithms later)
    const matchTable = swissMonrad(playerList, {...draftData, oppData});

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