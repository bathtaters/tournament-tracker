const { avg, diff, count, getGroups, getCombos, randomGroup } = require('./matchGen.utils');


// --- SPECIFIC SETTINGS --- \\

// Stats weighting for calculations
const weight = {
  penalty:   50000000, // Per rematched player or x2 for each bye
  matchRate:  1000000,
  oppMatch:     10000,
  gameRate:       100,
  oppGame:          1,
}

// Calculate single player's base score
const getPlayerScore = (stats) => !stats ? 0 :
  Object.keys(weight).reduce((tot,key) => tot + (key in stats ? stats[key] * weight[key] : 0), 0)

// Calculate score of 2 players (base + rematch penalties)
const getComboScore = (scores, opps) => ([playerA, playerB]) =>
  diff(scores[playerA], scores[playerB]) + (count(playerB, opps?.[playerA]) + count(playerA, opps?.[playerB])) * weight.penalty

// Calculate score for single player match (base + bye penalties)
const getSoloScore = (player, score, byes) => score + count(player, byes) * weight.penalty * 2

// Uncomment to enable logging of each combo's score for debugging
const logScores = (sc,gp,bs) => null //gp.forEach((e,i) => console.log(sc[i] === bs ? 'x' : '-', sc[i].toFixed(0), e))



// --- MAIN --- \\

function generateMatchups(stats, { playerspermatch, byes, oppData }) {
  // Randomize matches for initial pairing
  if (stats.noStats) return randomGroup(stats.ranking, playerspermatch)

  // Generate all possible match groupings
  const allPossible = getGroups(stats.ranking, playerspermatch)

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
      avg( getCombos(match, 2).map(getComboScore(playerScores, oppData)) )
    ))
  )

  // DEBUG LOG
  logScores(allScores, allPossible, Math.min(...allScores))

  // Return pairing with the lowest score
  return allPossible[allScores.indexOf(Math.min(...allScores))]
}


module.exports = generateMatchups;