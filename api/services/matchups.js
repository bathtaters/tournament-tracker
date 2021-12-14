// Get matchups for new round
// FORMAT: [ [ player/[team], player/[team] ], ...  ] (match table)
const { unflat, splicing, anyElements } = require('./utils');
const { shuffled } = require('./random');

const defPlaysPerMatch = 2;

// const getByes = "SELECT players FROM draftByes WHERE draftId = $1;";
// -> returns (0) undef, (1) {draftid, players[]}, (2+) [{draftid, players[]},...]

// Helper function to reverse-search for a replacement
function revReplaceIndex(arr2d, startInd, isReplace) {
    for (let i = startInd; i >= 0; i--) {
        for (let j = arr2d[i].length - 1; j >= 0; j--) {
            if (isReplace(arr2d[i][j],arr2d[i],j)) return [i,j];
        }
    }
    return;
}

// INPUT:
// draft = {players:[playerIds...], playerspermatch, byes:[playerIds...]},
// breakers { [playerId] : [ prior oppids ] }
// rankings = [playerids] OR null if firstRound,
// 
// RETURN:
// => (matchups) [[(match1) playerids, ...], [(match2) ...], ...]
function generateMatchups(draft, drops = null, priorOpps = null, rankings = null) {
    // Generate simple matchups
    let matches = rankings ?
        rankings.filter(p => draft.players.includes(p))
            .concat(draft.players.filter(p => !rankings.includes(p))) :
        shuffled(draft.players);
    if (drops) matches = matches.filter(p => !drops.includes(p));
    matches = unflat(matches, draft.playerspermatch || defPlaysPerMatch);
    
    // Don't allow multiple byes
    if (draft.byes) {
        // Go backwards to avoid array mutation issues
        for (let i = matches.length - 1; i >= 0; i--) {
            if (matches[i].length === 1 && draft.byes.includes(matches[i][0])) {
                // If player w/ bye already has a bye, find the nearest player w/o a bye
                const idx = revReplaceIndex(matches, i - 1, m => !draft.byes.includes(m));
                if (idx) {
                    // If replacement is found, swap in place
                    [matches[i][0], matches[idx[0]][idx[1]]] = 
                    [matches[idx[0]][idx[1]], matches[i][0]];
                }
            }
        }
    }

    // Don't allow same matchups
    if (priorOpps) {
        // Go backwards to avoid array mutation issues
        for (let i = matches.length - 1; i >= 0; i--) {
            for (let j = matches[i].length - 1; j > 0; j--) {
                // Get player's prior opponents
                const priorOpp = priorOpps[matches[i][j]] &&
                    priorOpps[matches[i][j]].oppids;
                // Check if player is paired with any of them
                if (priorOpp && anyElements(matches[i], priorOpp)) {
                    // Find swap player whose...
                    const idx = revReplaceIndex(matches, i - 1, (p,m,k) =>
                        // opponents are new to current player
                        !anyElements(splicing(m,k), priorOpp)
                        // AND vice versa
                        && (!priorOpps[p] || !anyElements(
                            splicing(matches[i],j),
                            priorOpps[p].oppids
                        ))
                    );
                    if (idx) {
                        // If replacement is found, swap in place
                        [matches[i][j], matches[idx[0]][idx[1]]] = 
                        [matches[idx[0]][idx[1]], matches[i][j]];
                    }
                }
            }
        }
    }

    return matches;
}

module.exports = generateMatchups;

// TEST
// generateMatchups({players:[1,2,3,4,5,6,7,8,9,10],playerspermatch:3},{1:{oppids:[7,4]},2:{oppids:[5,6]},3:{oppids:[8,9]},4:{oppids:[1,7]},5:{oppids:[2,6]},6:{oppids:[2,5]},7:{oppids:[1,4]},8:{oppids:[3,9]},9:{oppids:[2,8]}},[1,2,3,4,10,6,7,8,9,5],[5,6,7,8,9])
// = [[1,2,3],[4,5,9],[7,8,6],[10]]