// CALCs, COMBINERs & SORTER for PLAYER STATS

// Import constants
const { points } = require('../config/constants');

// Win % calculator
exports.rate = (score, record) => Math.max(
    score / (sumArr(record) * points.win),
    points.floor || 0
); // If no games played, returns NaN

// Builds player array of 'WLD' index (ie Player Win = 0, Player Loss = 1, Draw = 2)
exports.getWLD = ({ wins, maxwins }) => wins.filter(w => w === maxwins).length === 1 ?
    wins.map(w => +(w !== maxwins)) :
    wins.map(w => w === maxwins ? 2 : 1); // Draw if player wins == max, otherwise lose


// Calculate Stat Values //

exports.calcBase = (playerIdx, matchArr, { wins, draws, totalwins }, draft) => ({
    draftIds:    [draft], // In array for combineFinal
    matchRecord: Object.assign([0,0,0], { [matchArr[playerIdx]]: 1 }),
    gameRecord:  [ wins[playerIdx], totalwins - wins[playerIdx], draws ],
    matchScore:  [ points.win, 0, points.draw ][ matchArr[playerIdx] ],
    gameScore:   ( wins[playerIdx] * points.win ) + ( draws * points.draw ),
});

exports.calcRates = result => Object.assign(result, {
    matchRate: exports.rate(result.matchScore, result.matchRecord),
    gameRate:  exports.rate(result.gameScore,  result.gameRecord),
});

exports.calcOpps = (result, current, oppList) => {
    // Collect
    let oppMatch = [], oppGame = [];
    oppList && oppList.forEach(oppId => {
        if (current[oppId]) {
            isNaN(current[oppId].matchRate) || oppMatch.push(current[oppId].matchRate);
            isNaN(current[oppId].gameRate ) ||  oppGame.push(current[oppId].gameRate);
        }
    });
    // Average (In array for combineFinal)
    result.oppMatch = [ avgArr(oppMatch) ];
    result.oppGame  = [ avgArr(oppGame)  ];
    return result;
};


// Combining/Finalizing Stat Objects //

exports.combineStats = (a,b) => Object.assign(a, {
    matchRecord: addArrs(a.matchRecord, b.matchRecord),
    gameRecord:  addArrs(a.gameRecord,  b.gameRecord),
    matchScore:  a.matchScore + b.matchScore,
    gameScore:   a.gameScore  + b.gameScore,
});

exports.combineFinal = (final,curr) => Object.assign( combineStats(final,curr), {
    draftIds: final.draftIds.concat(curr.draftIds),
    oppMatch: final.oppMatch.concat(curr.oppMatch),
    oppGame:  final.oppGame.concat(curr.oppGame),
});

exports.finalize = result => {
    // If more than 1 draft, recalc rates
    if (result.draftIds.length > 1) result = calcRates(result);

    // Average oppRates (Ignoring NaN)
    result.oppMatch = result.oppMatch.filter(n => !isNaN(n));
    result.oppGame  = result.oppGame.filter(n  => !isNaN(n));
    result.oppMatch = avgArr(result.oppMatch);
    result.oppGame  = avgArr(result.oppGame);
    return result;
};


// Determine ranking using MTG rules //

exports.rankSort = (data, originalOrder, useMatchScore) => (a,b) => {
    // Same player
    if (a === b) return 0;

    // MTG rules:
    // 1. Match points (useMatchScore ? matchScore : matchRate)
    let val = useMatchScore ? 
        (data[b].matchScore || 0) - (data[a].matchScore || 0) :
        (data[b].matchRate  || 0) - (data[a].matchRate  || 0);
    if (val) return val;
    
    // 2. Opponents’ match-win percentage
    val = ((data[b].oppMatch || 0) - (data[a].oppMatch || 0))
    if (val) return val;
    
    // 3. Game-win percentage
    val = ((data[b].gameRate || 0) - (data[a].gameRate || 0))
    if (val) return val;
    
    // 4. Opponents’ game-win percentage
    val = ((data[b].oppGame  || 0) - (data[a].oppGame  || 0))
    if (val) return val;

    // 5. Original player order
    if (originalOrder) {
        if (!originalOrder.includes(a)) {
            if (originalOrder.includes(b)) return originalOrder.length;
        } else if (!originalOrder.includes(b)) return -originalOrder.length;
        val = originalOrder.indexOf(a) - originalOrder.indexOf(b);
        if (val) return val;
    }

    // Use UUIDs to settle otherwise
    return a < b ? 1 : -1;
};


//  HELPERS  //

// Add together every element in an array
const sumArr  = array => array.reduce((sum, n) => sum + n, 0);

// Sum parallel elements of two arrays
const addArrs = (arrA, arrB) => arrA.map((a,i) => a + arrB[i]);

// Get average value of array
const avgArr  = array => sumArr(array) / array.length;