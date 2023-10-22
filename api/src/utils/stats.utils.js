// CALCs, COMBINERs & SORTER for PLAYER STATS

// Import constants
const { points } = require('../config/constants');

// Win % calculator
exports.rate = (score, record, useFloor) => Math.max(
    score / (sumArr(record || []) * points.win),
    useFloor ? points.floor || 0 : 0
); // If no games played, returns NaN

// Builds player array of 'WLD' index (ie Player Win = 0, Player Loss = 1, Draw = 2)
exports.getWLD = ({ wins, maxwins }) =>
    wins.filter(w => {
        if (w === maxwins) return true;
        if (w < maxwins) return false;
        // Catch invalid state
        throw new Error("Invalid maxwins: "+maxwins+" => "+JSON.stringify(wins))
    }).length === 1 ?
        wins.map(w => +(w !== maxwins)) :
        wins.map(w => w === maxwins ? 2 : 1);
            // Draw if player wins == max, otherwise lose


// Calculate Stat Values //

exports.calcBase = (playeridx, wldArr, { wins, draws, totalwins }, event) => ({
    eventids:    [event], // In array for combineFinal
    matchRecord: Object.assign([0,0,0], { [wldArr[playeridx]]: 1 }),
    gameRecord:  [ wins[playeridx], totalwins - wins[playeridx], draws ],
    matchScore:  [ points.win, 0, points.draw ][ wldArr[playeridx] ],
    gameScore:   ( wins[playeridx] * points.win )// + ( draws * points.draw ), // ignore draws in game calculation
});

exports.calcRates = (result, useFloor) => Object.assign(result, {
    matchRate: exports.rate(result.matchScore, result.matchRecord, useFloor),
    gameRate:  exports.rate(result.gameScore,  result.gameRecord,  useFloor),
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

exports.combineFinal = (final,curr) => Object.assign( exports.combineStats(final,curr), {
    eventids: final.eventids.concat(curr.eventids),
    oppMatch: final.oppMatch.concat(curr.oppMatch),
    oppGame:  final.oppGame.concat(curr.oppGame),
});

exports.finalize = (result, useFloor) => {
    // If more than 1 event, recalc rates
    if (result.eventids.length > 1) result = exports.calcRates(result, useFloor);

    // Average oppRates (Ignoring NaNs)
    result.oppMatch = avgArr(result.oppMatch.filter(n => !isNaN(n)));
    result.oppGame  = avgArr(result.oppGame.filter(n  => !isNaN(n)));
    return result;
};


// Determine ranking using MTG rules //

exports.rankSort = (data, originalOrder, useMatchScore) => (a,b) => {
    // Same player
    if (a === b) return 0

    if (data) {
        if (data[a] && data[b]) {

            // MTG rules:
            // 1. Match points (useMatchScore ? matchScore : matchRate)
            let val = useMatchScore ? 
                (data[b].matchScore || 0) - (data[a].matchScore || 0) :
                (data[b].matchRate  || 0) - (data[a].matchRate  || 0) ;
            if (val) return val
            
            // 2. Opponents’ match-win percentage
            val = ((data[b].oppMatch || 0) - (data[a].oppMatch || 0))
            if (val) return val
            
            // 3. Game-win percentage
            val = ((data[b].gameRate || 0) - (data[a].gameRate || 0))
            if (val) return val
            
            // 4. Opponents’ game-win percentage
            val = ((data[b].oppGame  || 0) - (data[a].oppGame  || 0))
            if (val) return val
        }

        // If data exists but only 1 player
        else if (data[b]) return  1
        else if (data[a]) return -1
    }

    // 5. Original player order
    if (originalOrder) {
        const aIdx = originalOrder.indexOf(a),
            bIdx = originalOrder.indexOf(b);

        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        else if (bIdx !== -1) return  originalOrder.length;
        else if (aIdx !== -1) return -originalOrder.length;
    }

    // Use UUIDs to settle otherwise (Reverse order)
    return a < b ? 1 : -1;
};


//  HELPERS  //

// Add together every element in an array
const sumArr  = array => array.reduce((sum, n) => sum + n, 0);

// Sum parallel elements of two arrays
const addArrs = (arrA, arrB) => arrA.map((a,i) => a + arrB[i]);

// Get average value of array
const avgArr  = array => sumArr(array) / array.length;