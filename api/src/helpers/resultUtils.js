// BASIC GAME/MATCH Conversions
const points = require('../config/constants.json').points;
const { flip } = require('./random');

const resultCalc = {
    record: (w,d,c) => [w, c - w - d, d],
    score: (w,d) => w * points.win + d * points.draw,
    rate: (w,d,c) => Math.max(
        resultCalc.score(w,d) / (c * points.win),
        points.floor
    ),
    average: (prefix,players) => players.reduce((sum,p) =>
        sum + resultCalc.rate(
            p[prefix+'wins'],
            p[prefix+'draws'],
            p[prefix+'count']
        ),
    0) / players.length,
    combine: (a, b) => ({
        draftIds: a.draftIds.concat(b.draftIds),
        matches: a.matches.map((v,i) => v + b.matches[i]),
        matchScore: a.matchScore + b.matchScore,
        matchRate: a.matchRate + b.matchRate,
        games: a.games.map((v,i) => v + b.games[i]),
        gameScore: a.gameScore + b.gameScore,
        gameRate: a.gameRate + b.gameRate,
        oppMatch: a.oppMatch + b.oppMatch,
        oppGame: a.oppGame + b.oppGame,
        avgCounter: (a.avgCounter || 1) + (b.avgCounter || 1),
    }),
    finalize: d => {
        res = {
            ...d,
            matchRate: d.matchRate / (d.avgCounter || 1),
            gameRate: d.gameRate / (d.avgCounter || 1),
            oppMatch: d.oppMatch / (d.avgCounter || 1),
            oppGame: d.oppGame / (d.avgCounter || 1),
        }; delete res.avgCounter;
        return res;
    },
    calcAll: (d,opps) => ({
        draftIds: [d.draftid],
        matches: resultCalc.record(d.matchwins,d.matchdraws,d.matchcount),
        matchScore: resultCalc.score(d.matchwins,d.matchdraws),
        matchRate: resultCalc.rate(d.matchwins,d.matchdraws,d.matchcount),
        games: resultCalc.record(d.gamewins,d.gamedraws,d.gamecount),
        gameScore: resultCalc.score(d.gamewins,d.gamedraws),
        gameRate: resultCalc.rate(d.gamewins,d.gamedraws,d.gamecount),
        oppMatch: resultCalc.average('match',opps),
        oppGame: resultCalc.average('game',opps),
    }),
    //  Determine ranking using MTG rules
    // 1. Match points (sameTournament) / Match-win percentage
    // 2. Opponents’ match-win percentage
    // 3. Game-win percentage
    // 4. Opponents’ game-win percentage
    rankSort: (data, useMatchScore, coinFlip = false) => (a,b) => 
        (useMatchScore ?
            data[b].matchScore - data[a].matchScore :
            data[b].matchRate  - data[a].matchRate) ||
        (data[b].oppMatch - data[a].oppMatch) ||
        (data[b].gameRate - data[a].gameRate) ||
        (data[b].oppGame  - data[a].oppGame)  ||
        (coinFlip ? (flip() ? 1 : -1) : 0),
    rankScore: (data, useMatchScore = true, coinFlip = true) => (a,b) => 
        10000 * (useMatchScore ?
            data[b].matchScore - data[a].matchScore :
            (data[b].matchRate  - data[a].matchRate) * 10) ||
        1000 * (data[b].oppMatch - data[a].oppMatch) ||
        100 * (data[b].gameRate - data[a].gameRate) ||
        10 * (data[b].oppGame  - data[a].oppGame)  ||
        (coinFlip ? (flip() ? 1 : -1) : 0),
};

module.exports = resultCalc;

// module.exports = {
//     games: {
//         record: (record, wins, idx, draws=0) => {
//             if (!record) record = calc.blank.record();
//             record[0] += wins[idx] || 0;
//             record[1] += wins.reduce((r,n)=>r+n,0) - (wins[idx] || 0);
//             record[2] += draws;
//             return record;
//         },
//         score: (score,wins,idx,draws=0) => 
//             (score || calc.blank.score()) +
//             (points.win * wins[idx]) + 
//             (points.draw * draws),
//         count: (wins,draws=0) => wins.reduce((a,b)=>a+b,0) + draws,
//     },
//     match: {
//         record: (recordPtr, winner, playerIdx) => {
//             if (!recordPtr) recordPtr = calc.blank.record();
//             const incIdx = winner.length === 1 ? +(winner[0] !== playerIdx) : 2;
//             recordPtr[incIdx]++;
//             return recordPtr;
//         },
//         score: (score, winner, playerIdx) => {
//             if (!score) score = calc.blank.score();
//             if (winner.length !== 1) return score + points.draw;
//             if (winner[0] === playerIdx) return score + points.win;
//             return score;
//         },
//         winner: wins => wins.reduce((res,w,i) => {
//             if (res[1] == w) res[0].push(i);
//             else if (res[1] < w) res[0] = [i];
//             return res;
//         }, [[],-1])[0],
//         isActive: (match,draft) => match.round == draft.roundactive,
//         isFinished: (match,bestOf) =>
//             match.playerwins.some(w => w >= Math.ceil(bestOf / 2)) ||
//             calc.games.count(match.playerwins,match.draws) >= bestOf,
//         // playerpts: match.playerwins.map((_,i,arr)=>winArr.points(arr,i,match.draws)),
//         // wins: Math.max(...match.playerwins),
//     },
//     combine: {
//         record: (a,b) => (a || calc.blank.record()).map((v,i) => b && b[i] ? v + b[i] : v),
//         score: (a,b) => (a || calc.blank.score()) + (b || calc.blank.score()),
//     },
//     blank: {
//         record: () => [0,0,0],
//         score: () => 0,
//         breakers: isMain => {
//             const blank = isMain ? { oppo:[] } : {};
//             if (isMain) breakersFields.base.forEach(f=>blank[f]=0);
//             breakersFields.base.forEach(f=>blank[f+'Bye']=0);
//             return blank;
//         },
//     },
//     toPercent: (score, count) => 
//         Math.max(score / count / points.win, points.floor),
// }