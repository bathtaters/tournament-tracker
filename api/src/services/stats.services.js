// Calculate records from DB data
const {
    getWLD, calcBase,
    calcRates, calcOpps,
    combineStats, combineFinal,
    finalize, rankSort
} = require('../utils/stats.utils');
const logger = require('../utils/log.adapter');


/**
 * Get Player Stats & Determine Rankings
 * @param {object} matchData - { eventid: [{ reported, players, wins, draws, maxwins, totalwins }, ...], ... }
 * @param {string[]} originalOrder - [ playerids, ... ]
 * @param {object} oppData - { eventid: { playerid: [ oppids, ... ], ... }, ... }
 * @param {boolean} [useMatchScore=true] - use matchScore (Within same event) vs percent (Comparing apples to oranges)
 * @returns - { ranking: [ playerids... ], playerid: { ...playerStats }, ... }
 */
function stats(matchData, originalOrder, oppData, useMatchScore = true) {
    let final = {};

    // Each event
    Object.entries(matchData).forEach(([event, matches]) => {
        let current = {};

        // Each match (skip if not reported)
        matches.forEach(match => {
            if (match.reported) { 
                
                // Get [W,L,D] indexes
                const results = getWLD(match);

                // Each player 
                match.players.forEach((player, playeridx) => {
                    current[player] = current[player]
                        // Combine entry
                        ? combineStats(
                            current[player],
                            calcBase(playeridx, results, match, event)
                        // New entry
                        ) : calcBase(playeridx, results, match, event);
                });
            }
        });

        // Append match/game rates
        Object.keys(current).forEach(player => current[player] = calcRates(current[player]));

        // Append opp match/game rates (& push to 'final')
        Object.keys(current).forEach(player => {
            final[player] = final[player]
                // Combine entry
                ? combineFinal(
                    final[player],
                    calcOpps(current[player], current, oppData[event][player]) 
                // New entry
                ) : calcOpps(current[player], current, oppData[event][player]);
        });
    });

    // Finalize records
    Object.keys(final).forEach(player => final[player] = finalize(final[player]));

    // Rank players
    final.ranking = Object.keys(final).sort(rankSort(final, originalOrder, useMatchScore));
    
    return final;
}


module.exports = stats;