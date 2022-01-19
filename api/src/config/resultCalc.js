// BASIC GAME/MATCH Conversions
const points = require('./constants.json').points;

const resultCalc = {
    record: (w,d,c) => [ w || 0,  (c||0) - (w||0) - (d||0),  d || 0 ],
    score: (w,d) => (w||0) * points.win + (d||0) * points.draw,
    rate: (w,d,c) => c ? Math.max(
        resultCalc.score(w,d) / (c * points.win),
        points.floor
    ) : 0,
    average: (prefix,players) => players.length && 
        players.reduce((sum,p) =>
            sum + resultCalc.rate(
                p[prefix+'wins'],
                p[prefix+'draws'],
                p[prefix+'count']
            ),
            0
        ) / players.length,
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
            // Recalc these
            matchRate: resultCalc.rate(d.matches[0],d.matches[2],d.matches[0]+d.matches[1]+d.matches[2]),
            gameRate:  resultCalc.rate(d.games[0],  d.games[2],  d.games[0] + d.games[1] + d.games[2]),
            // Average these
            oppMatch: d.oppMatch / (d.avgCounter || 1),
            oppGame: d.oppGame / (d.avgCounter || 1),
        };
        delete res.avgCounter;
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
    rankSort: (data, useMatchScore, originalOrder) => (a,b) => {
        // Same player
        if (a === b) return 0;
    
        // MTG rules:
        // 1. Match points (sameTournament) / Match-win percentage
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
    },
};

module.exports = resultCalc;