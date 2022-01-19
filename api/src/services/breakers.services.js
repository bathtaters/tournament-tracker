// Calculate records from DB data
const logger = console;
const resultCalc = require('../config/resultCalc');

// Get breakers data & determine winner

function breakers(data, originalOrder, sameTournament = true) {
    
    // Build map of data
    let dataMap = {};
    data.forEach((a,ai) => a.forEach((b,bi) => dataMap[b.playerid] = [ai,bi]));

    // Calculate results (Combining multiples for a player)
    let result = {};
    data[0].forEach(d => {
        // Get opponent stats
        const opps = d.oppids ? d.oppids.map(o => {
            const [i,j] = dataMap[o];
            return data[i][j] || {};
        }) : [];
        // Create or add to entry
        result[d.playerid] = result[d.playerid]
            ? resultCalc.combine(
                resultCalc.calcAll(d, opps),
                result[d.playerid]
            ) : resultCalc.calcAll(d, opps);
    });

    // Finalize records w/ multiple entries (Calc averages)
    Object.keys(result).forEach(p => {
        if (result[p].avgCounter) result[p] = resultCalc.finalize(result[p]);
    });

    // Rank players
    result.ranking = Object.keys(result).sort(
        resultCalc.rankSort(result, sameTournament, originalOrder)
    );
    
    return result;
}


module.exports = breakers;