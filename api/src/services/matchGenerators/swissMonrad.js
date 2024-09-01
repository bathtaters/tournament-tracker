const { avg, diff, count, getGroups, getGroupsSimple, randomGroup } = require('./matchGen.utils');


// --- SPECIFIC SETTINGS --- \\

// Maximum number of players before simple match-maker is run
const ALGO_THRESHOLD = 10

// Stats weighting for calculations
const weight = {
  penalty:   5000000000, // Per rematched player or x2 for each bye
  matchRate:  100000000,
  oppMatch:     1000000,
  gameRate:       10000,
  oppGame:          100,
}

// Tie-breaker: Check number of times players played each other in all other events combined.
const getMatchupCount = (allMatchups, playerA, playerB) => Number(allMatchups.find(({ id, opp }) => playerA === id && playerB === opp)?.count || 0)

// Calculate single player's base score
const getPlayerScore = (stats) => !stats ? 0 :
  Object.keys(weight).reduce((tot,key) => tot + (key in stats && !isNaN(stats[key]) ? stats[key] * weight[key] : 0), 0)

// Calculate score of 2 players (base + rematch penalties)
const getComboScore = (scores, opps, allMatchups) => ([playerA, playerB]) =>
  diff(scores[playerA], scores[playerB]) + (count(playerB, opps?.[playerA]) + count(playerA, opps?.[playerB])) * weight.penalty
  + getMatchupCount(allMatchups, playerA, playerB)

// Calculate score for single player match (base + bye penalties)
const getSoloScore = (player, score, byes) => score + count(player, byes) * weight.penalty * 2



// --- MAIN --- \\

function generateMatchups(stats, { playerspermatch, byes, oppData, allMatchups }) {
  // Randomize matches for initial pairing
  if (stats.noStats) return randomGroup(stats.ranking, playerspermatch)

  if (stats.ranking.length > ALGO_THRESHOLD)
    return getGroupsSimple(stats.ranking, playerspermatch)

  // Calculate base player scores
  const playerScores = stats.ranking.reduce((scores, player) => 
    Object.assign(scores, { [player]: getPlayerScore(stats[player]) }),
  {})

  // Calculate scores for every possible pairing
  const allScores = allPossible.map((matchList) =>
    avg(matchList.map((match) =>
      // Bye match
      match.length === 1 ? getSoloScore(match[0], playerScores[match[0]], byes) :

      // Standard match (average out scores of each player pair)
      avg( getCombos(match, 2).map(getComboScore(playerScores, oppData, allMatchups || [])) )
    ))
  )
  
  // Get pairing with the lowest score
  const bestScore = Math.min(...allScores)
  // logScores(allScores, allPossible, bestScore) // DEBUG LOG
  const bestMatch = allPossible[allScores.indexOf(bestScore)]

  // Catch error
  if (!bestMatch) {
    console.error('SWISS MONRAD Input Data:', stats, { playerspermatch, byes, oppData })
    console.error('SWISS MONRAD Results:', resultsLogObject(allScores, bestScore, Math.max(...allScores)))
    throw new Error('SWISS MONRAD failed to find best match pairing.')
  }

  return bestMatch
}


module.exports = generateMatchups;



// ----- Logging ------ \\

// Log each combo's score for debugging
const logScores = (sc,gp,bs) => gp.forEach((e,i) => console.log(sc[i] === bs ? 'x' : '-', sc[i].toFixed(0), e)) || console.log('RESULTS:',resultsLogObject(sc, bs, Math.max(...sc)))

// Get results as readable object for error reporting
const resultsLogObject = (allScores, bestScore, worstScore) => ({
  bestScore, worstScore,
  totalCount: allScores.length,
  bestCount: allScores.filter(s => s === bestScore).length,
  worstCount: allScores.filter(s => s === Math.max(...allScores)).length
})