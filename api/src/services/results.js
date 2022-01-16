// Calculate records from DB data
const resultCalc = require('../utils/resultUtils');
// const { breakersFields } = require('../config/constants');
// const { concatUnique } = require('../helpers/utils');



// Get results based on match
function toMatchResults(data, asScore, byDraft = true, onlyPlayer = null) {
    // TESTING
    console.log('toMatchResults:','asScore:',asScore,', byDraft:',byDraft,'onlyPlayer:',onlyPlayer);
    console.log('\tDATA:',Array.isArray(data) ? '['+data.length+']' : Object.keys(data));
    console.log('\tDRAFT:', data.draft,'\n\tSAMPLE MATCH:',(data.matches || data)[0]);

    const resultAs = asScore ? 'score' : 'record';

    // Init collector and get draftId if there's only 1 draft
    let records = onlyPlayer && !byDraft ? null : {};
    const onlyDraftId = data.draft && data.draft.draftid;

    for (const match of (data.matches || data)) {
        // Get onlyPlayer's index in match array
        const playerIdx = onlyPlayer ? match.playerids.findIndex(pid => onlyPlayer.includes(pid)) : -2;
        if (playerIdx === -1) continue;
        
        // Get related draft ID
        const draftId = onlyDraftId || match.draftid || 'N/A';

        // Determine who won
        const winner = calc.match.winner(match.playerwins);

        // Update results for all players in match
        if (!onlyPlayer) {
            match.playerids.forEach((pid,idx) => {
                let ptr = record[byDraft ? draftId : pid];
                if (!ptr) ptr = {};
                ptr = ptr[byDraft ? pid : draftId];
                ptr = calc.match[resultAs](ptr,winner,idx);
            });
        
        // Update results for the only player
        } else {
            let ptr = record;
            if (byDraft) ptr = ptr[draftId];
            ptr = calc.match[resultAs](ptr,winner,playerIdx);
        }
    }
    return records;
}



// Get results based on games w/in match(es)
function toGameResults(data, asScore, byDraft = true, onlyPlayer = null) {
    // TESTING
    console.log('toGameResults:','asScore:',asScore,', byDraft:',byDraft,'onlyPlayer:',onlyPlayer);
    console.log('\tDATA:',Array.isArray(data) ? '['+data.length+']' : Object.keys(data));
    console.log('\tDRAFT:', data.draft,'\n\tSAMPLE MATCH:',(data.matches || data)[0]);

    const resultAs = asScore ? 'score' : 'record';

    // Init collector and get draftId if there's only 1 draft
    let records = onlyPlayer && !byDraft ? null : {};
    const onlyDraftId = data.draft && data.draft.draftid;

    for (const match of (data.matches || data)) {
        // Get onlyPlayer's index in match array
        const playerIdx = onlyPlayer ? match.playerids.findIndex(pid => onlyPlayer.includes(pid)) : -2;
        if (playerIdx === -1) continue;
        
        // Get related draft ID
        const draftId = onlyDraftId || match.draftid || 'N/A';

        // Update results for all players in match
        if (!onlyPlayer) {
            match.playerids.forEach((pid,idx) => {
                let ptr = record[byDraft ? draftId : pid];
                if (!ptr) ptr = {};
                ptr = ptr[byDraft ? pid : draftId];
                ptr = calc.games[resultAs](
                    ptr, match.playerwins, idx, match.draws
                );
            });
        
        // Update results for the only player
        } else {
            let ptr = record;
            if (byDraft) ptr = ptr[draftId];
            ptr = calc.games[resultAs](
                ptr, match.playerwins, playerIdx, match.draws
            );
        }
    }
    return records;
}



// Get breakers data & determine winner

function toBreakers(data, sameTournament = true) {
    // Build map of data
    let dataMap = {};
    data.forEach((a,ai) => a.forEach((b,bi) => dataMap[b.playerid] = [ai,bi]));

    // Calculate results (Combining multiples for a player)
    let result = {};
    data[0].forEach(d => {
        // Get opponent stats
        const opps = d.oppids ? d.oppids.map(o => {
            const idx = dataMap[o];
            return data[idx[0]][idx[1]] || {};
        }) : [];
        // Create or add to entry
        result[d.playerid] = result[d.playerid]
            ? resultCalc.combine(
                resultCalc.calcAll(d,opps),
                result[d.playerid]
            ) : resultCalc.calcAll(d,opps);
    });

    // Finalize records w/ multiple entries (Calc averages)
    Object.keys(result).forEach(p => {
        if (result[p].avgCounter) result[p] = resultCalc.finalize(result[p]);
    });

    // return result;

    // Rank players
    result.ranking = Object.keys(result).sort(
        resultCalc.rankSort(result,sameTournament,false)
    );
    return result;
}


module.exports = {
    toMatchResults, toGameResults, toBreakers,
}