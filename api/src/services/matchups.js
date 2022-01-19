// Get matchups for new round
// => Match Table: (2D ID Array) [ [ playerIds in match1 ], [ match2 ], ...  ]
const { unflat, splicing, anyElements, revReplace2dIndex } = require('../utils/utils');
const defs = require('../config/validation').config.defaults.draft;

// Generate Match Table //

function generateMatchups(ranking, playerspermatch, byes, drops, allOpps) {
    // Generate simple matchups (w/o drops)
    let matches = [...ranking];
    if (drops) matches = matches.filter(p => !drops.includes(p));
    matches = unflat(matches, playerspermatch || defs.playerspermatch);
    
    // Don't allow players to have multiple byes
    if (byes) {
        for (let i = matches.length; i-- > 0; ) { // mutate in reverse
            if (matches[i].length === 1 && byes.includes(matches[i][0])) {
                // Find the nearest swap w/o a bye
                const idx = revReplace2dIndex(matches, i, m => !draft.byes.includes(m));
                if (idx) {
                    [matches[i][0], matches[idx[0]][idx[1]]] = 
                    [matches[idx[0]][idx[1]], matches[i][0]];
                }
                // If no replacement is found, player stuck w/ 2nd bye
            }
        }
    }

    // Don't allow rematches
    if (allOpps) {
        for (let i = matches.length; i-- > 0; ) {
            for (let j = matches[i].length; j-- > 0; ) {
                const playerId = matches[i][j];
                const playerOpps = allOpps[playerId] && allOpps[playerId].oppids;

                if (playerOpps && anyElements(matches[i], playerOpps)) {
                    // Find a swap who won't cause another rematch
                    const idx = revReplace2dIndex(
                        matches, i,
                        isUniqueMatchup(playerOpps, allOpps, splicing(matches[i], j))
                    );
                    if (idx) {
                        [playerId, matches[idx[0]][idx[1]]] = 
                        [matches[idx[0]][idx[1]], playerId];
                    }
                    // If no replacement is found, rematch will happen
                }
            }
        }
    }
    return matches;
}


// Callback for checking for unique matchups
const isUniqueMatchup = (playerOpps, allOpps, matchMinusPlayer) => (testId, testMatch, testIdx) =>
    !anyElements(                   // No overlap between:
        splicing(testMatch, testIdx),   // test player's current opponents
        playerOpps                      // current player's prior opponents
    ) && (                          // AND
        !allOpps[testId] ||         // test player doesn't have prior opponents
        !anyElements(               // OR No overlap between:
            matchMinusPlayer,           // current player's current opponents
            allOpps[testId].oppids      // test player's prior opponents
        )
    );


module.exports = generateMatchups;