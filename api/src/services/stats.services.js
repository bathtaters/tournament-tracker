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
 * @param {object} matchData - { draftId: [{ reported, players, wins, draws, maxwins, totalwins }, ...], ... }
 * @param {string[]} originalOrder - [ playerIds, ... ]
 * @param {object} oppData - { draftId: { playerId: [ oppIds, ... ], ... }, ... }
 * @param {boolean} [useMatchScore=true] - use matchScore (Within same draft) vs percent (Comparing apples to oranges)
 * @returns - { ranking: [ playerIds... ], playerId: { ...playerStats }, ... }
 */
function stats(matchData, originalOrder, oppData, useMatchScore = true) {
    let final = {};

    // Each draft
    Object.entries(matchData).forEach(([draft, matches]) => {
        let current = {};

        // Each match (skip if not reported)
        matches.forEach(match => {
            if (match.reported) { 
                
                const results = getWLD(match); // Results as [W,L,D] indexes

                // Each player 
                match.players.forEach((player, playerIdx) => {
                    current[player] = current[player]
                        // Append base stats
                        ? combineStats(
                            current[player],
                            calcBase(playerIdx, results, match, draft)
                        // Create base stats
                        ) : calcBase(playerIdx, results, match, draft);
                });
            }
        });

        // Append match/game rates
        Object.keys(current).forEach(player => {
            if (current[player])
                current[player] = calcRates(current[player]);
        });

        // Append opp match/game rates & push to 'final'
        Object.keys(current).forEach(player => {
            if (current[player]) {
                final[player] = final[player]
                    // Append to other scores
                    ? combineFinal(
                        final[player],
                        calcOpps(current[player], current, oppData[draft][player])  // +oppRates
                    // Create final score
                    ) : calcOpps(current[player], current, oppData[draft][player]); // +oppRates
            }
        });
    });

    // Finalize records
    Object.keys(final).forEach(player => { final[player] = finalize(final[player]); });

    // Rank players
    final.ranking = Object.keys(final).sort(rankSort(final, originalOrder, useMatchScore));
    
    return final;
}


module.exports = stats;