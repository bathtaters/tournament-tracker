// Translate from storage to human readable

// MATCH Conversions
const { includesVal } = require('./utils');

// const matchResult = {
//     fromCode: (code, playerArr, matchestates) =>
//         code < 1 ?
//             matchestates[code + 1] : // Simple value (pending/draw)
//             // Was playerArr given? return actual value : just return 'win#'
//             Array.isArray(playerArr) ? playerArr[code - 1] : matchestates[2] + code,
//     toCode: (winner, matchestates) => {
//         if (typeof winner !== 'string') return winner;
//         // Convert from simple value (pending/draw)
//         if (matchestates.includes(winner)) return matchestates.indexOf(winner) - 1;
//         // Convert from 'win#'
//         if (winner.includes(matchestates[2])) return Number(winnerCode.replace(matchesResults[2],''));
//         return winner;
//     },
// }
// const updateRecord = {
//     record: (entry, code, index) => {
//         entry[code ? +(code !== index+1) : 2]++; return entry;
//     },
//     points: (entry, code, index) =>
//         entry + (5 * (code < 1 ? code+1 : (code === index+1 ? 2 : 0))),
// }
const points = { win: 3, draw: 1, min: 0.33 };
const winArr = {
    record: (wins,idx,draws=0) => {
        const win = wins[idx];
        const loss = wins.reduce((r,n)=>r+n,0) - wins;
        return [win,loss,draws];
    },
    points: (wins,idx,draws=0) => 
        (points.win * wins[idx]) + 
        (points.draw * draws),
    percent: (wins,idx,draws=0) => Math.max(
        winArr.points(wins,idx,draws) /
        (points.win * wins.reduce((r,n)=>r+n,0)),
        points.min
    ),
}

// UPDATE TO MATCH:
//  toMatchPoints: 3 * wins + 1 * draws 
//  toMatchRecord: [wins, losses, draws] <matches>
//  toGameRecord: [wins, losses, draws, matchResult = (win<1>,lose<-1>,draw<0>,pending<NULL>)] <games>
//  toBreakers: { matchPoints, gamePoints, matchPercent, gamePercent, oppMatch, oppGame, byes } (NOTE: min percent = 33.33%)

// toRecord({ matches: [matchData], draft: draftData } || [matchData + draftData], [usePlayerIds]?)
//  matchData = [{id, round, players[], playerids[], playerwins[], draws},...]
//  draftData = {draftid, draft, roundactive, bestof}
//  usePlayerIds = [UUID, ... ]
//      => if {matches,draft} && [usePlayerIds]: record
//      => if [usePlayerIds]: {draft: record, ... total: record`}
//      => else: {playerId: (total:, draft:) record, ...}
// 
//      Group by: players, draft, both, none
//      Results as: records, points, percentages
//      Results from: matches, games
// 
//  BY NONE = total
//  BY PLAYER = { playerId: total, ... }
//  BY BOTH = { playerId: { draftId: record, ..., total }, ... }
// 
//  FROM MATCHES = match.mostGamePoints +1 win
//  FROM GAMES = winArr
const count = (arr,pred) => typeof pred === 'function' ?
    arr.reduce((c,value,index,array) => c + +!!pred(value,index,array), 0) :
    arr.reduce((c,e) => c + +(e === pred), 0);
var match = {
    id: 'UUID-m1',
    round: 1,
    players: ['PlayerA', 'PlayerB'],
    playerids: ['UUID-p1', 'UUID-p2'],
    playerwins: [1, 1],
    draws: 1,
};
var draft = {
    draftid: 'UUID-d1',
    draft: 'DraftTitle',
    roundactive: 1-10,
    bestof: 3,
};
var result = {
    matchisactive: match.round == draft.roundactive,
    matchisfinished:
        match.playerwins.some(w => w >= Math.ceil(draft.bestof / 2)) ||
        match.playerwins.reduce((r,n)=>r+n,0) + match.draws >= draft.bestof,
    playerpts: match.playerwins.map((_,i,arr)=>winArr.points(arr,i,match.draws)),
    wins: Math.max(...match.playerwins),
    matchwinner:
        count(match.playerwins,result.wins) === 1 ?
        match.playerids[result.playerpts.indexOf(result.winningpts)] :
        null,
}

function toRecord(data, onlyPlayer, resultAs = 'records', {byPlayer=0, byDraft=0}, gameRecords = false) {
    let record = {};
    for (const match of (data.matches || data)) {
        if (onlyPlayer && match.playerids.every(id=>!onlyPlayer.includes(id))) continue;
        record = updateRecord(
            match, data.draft,
            onlyPlayer ?
                match.playerids.find(id=>onlyPlayer.includes(id)) :
                null
        );
    }
    return record;


    // Player's record for a draft
    if (data.draft && playerIds) return;
    
    // Player's record for all drafts
    else if (playerIds) return;
    
    // All player records for a draft
    else if (data.draft) return;

    // All player records for all drafts
    return;
}


// function toRecord(asPoints, matches, playerId = null) {
//     const blankEntry = asPoints ? () => 0 : () => [0,0,0];
//     const updateMethod = asPoints ? updateRecord.points : updateRecord.record;
//     let records = playerId ? blankEntry() : {};
//     if (playerId) {
//         const playerIndex = includesVal(playerId);
//         for (const match of matches) {
//             if (match.players.length === 1) match.winner = 1; // Only player wins by default
//             if (match.winner === -1) continue;
//             const i = match.players.findIndex(playerIndex);
//             if (i !== -1) records = updateMethod(records, match.winner, i);
//         }
//     } else {
//         const updateAll = (plays, code, res, index = -1) => {
//             plays.forEach((p,i) => {
//                 // console.log('PLAYER',p,'RES',res);
//                 if (index !== -1) i = index;
//                 if (Array.isArray(p)) return res = updateAll(p, code, res, i);
//                 if (!(p in res)) res[p] = blankEntry();
//                 if (code !== -1) res[p] = updateMethod(res[p], code, i);
//             });
//             return res;
//         }
//         for (const match of matches) {
//             if (match.players.length === 1) match.winner = 1; // Only player wins by default
//             records = updateAll(match.players, match.winner, records);
//         }
//     }
//     return records;
// }

// CLOCK Conversions
const clockStates = require('../db/constants').clockStates;
function toCount(clock) {
    if (!clock.clockstart) return clock.clockmod == 0 ? -1 : Math.floor(clock.clockmod);
    const secs = Math.floor(clock.clockmod + (new Date() - clock.clockstart) / 1000);
    return secs;
}
function toRemaining(clock) {
    if (!clock.clockstart && clock.clockmod == 0) return -1;
    const secs = clock.clocklimit - toCount(clock);
    return secs < 0 ? 0 : secs;
}
function toEndTime(clock) {
    if (!clock.clockstart) return;
    return new Date(clock.clockstart.getTime() + (clock.clocklimit + clock.clockmod) * 1000);
}
function toState(clock) {
    if (!clock.clockstart) return clockStates[clock.clockmod == 0 ? 2 : 3];
    return clockStates[toRemaining(clock) ? 1 : 0];
}
const calcAll = (clock) => ({
    count: toCount(clock),
    limit: clock.clocklimit,
    remaining: toRemaining(clock),
    endTime: toEndTime(clock),
    state: toState(clock),
});

module.exports = {
    // matches
    playerArr, matchResult, toRecord,
    // Clocks
    toCount, toRemaining, toEndTime, toState, calcAll,
}