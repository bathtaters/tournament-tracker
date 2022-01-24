// Calculate records from DB data
const logger = console;
const { combine, calcAll, rankSort, finalize } = require('../utils/breakers.utils');

// Get breakers data & determine winner

function breakers(data, originalOrder, sameTournament = true) {
    
    // Index data by [playerId][draftId] for opponent lookup
    const playerData = {};
    data.forEach((d,idx) => {
        if (!playerData[d.draftid]) playerData[d.draftid] = {};
        if (d.playerid in playerData[d.draftid])
            logger.warn('Duplicate player-draft data:',d.playerid,d.draftid);
        playerData[d.draftid][d.playerid] = idx;
    });

    // Calculate results (Combining multiples for a player)
    let result = {};
    data.forEach(d => {
        // Collect opponent stats (Warn if oppId doesn't exist)
        const opps = d.oppids ? d.oppids.map(o => 
            // Safely get from 
            (d.draftid in playerData && o in playerData[d.draftid] &&
                data[playerData[d.draftid][o]]) ||
            logger.warn('Opponent missing from draftData:',o)
        ).filter(Boolean) : [];

        result[d.playerid] = result[d.playerid]
            // Append entry
            ? combine(
                calcAll(d, opps),
                result[d.playerid]
            // Create entry
            ) : calcAll(d, opps);
    });

    // Finalize records w/ multiple entries (Calc averages)
    Object.keys(result).forEach(p => {
        if (result[p].avgCounter) result[p] = finalize(result[p]);
    });

    // Rank players
    result.ranking = Object.keys(result).sort(
        rankSort(result, originalOrder, sameTournament)
    );
    
    return result;
}


module.exports = breakers;