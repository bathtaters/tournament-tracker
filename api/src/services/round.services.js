const swissMonrad = require('./matchGenerators/swissMonrad');
const toBreakers = require('./breakers.services');
const { arrToObj } = require('../utils/shared.utils');

// HELPER: Convert array of keys into single object using 'value' as value for each key
const monoValueObj = (keys, value) => keys.reduce((obj, key) => 
    Object.assign(obj, { [key]: value }), 
    {}
);

// Builds queries for creating a round
function newRound({ draftData, drops, breakers, autoReportByes = true }) {
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

    if (draftData.roundactive === draftData.roundcount) return matchBase; // Draft has ended

    // Collect data for match generator
    let playerList = draftData.roundactive ?
        toBreakers([breakers], draftData.players).ranking :
        draftData.players || [];
    if (drops) playerList = playerList.filter(p => !drops.includes(p));

    const oppData = draftData.roundactive && arrToObj('playerid', { valKey: 'oppids' })(breakers);

    // Generate match table (Can add more alogrithms later)
    const matchTable = swissMonrad(playerList, {...draftData, oppData});

    // Format for DB write (auto-reporting byes)
    const byeWins = autoReportByes ? Math.ceil((draftData.bestof + 1) / 2) : 0;
    return {
        ...matchBase,

        matches: matchTable.map(match => ({
            ...matchBase,
            players: monoValueObj(match, match.length === 1 ? byeWins : 0),
            reported: autoReportByes && match.length === 1,
        }))
    };
}

module.exports = newRound;