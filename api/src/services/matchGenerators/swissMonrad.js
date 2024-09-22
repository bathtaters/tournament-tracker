const { avg, diff, count, getGroups, getGroupsSimple, randomGroup, shuffle } = require('./matchGen.utils');
const { getCombinations } = require('../../utils/combination.utils');
const { pairingThreshold } = require('../../config/meta');


// --- SPECIFIC SETTINGS --- \\

// Stats weighting for calculations
const weight = {
  penalty:  10000000004, // Per rematched player or x2 for each bye
  matchRate:  100000003,
  oppMatch:     1000002,
  gameRate:       10001,
  oppGame:          100,
  matchups:           0.001,
}

// Tie-breaker: Check number of times players played each other in all other events combined.
const getMatchupCount = (allMatchups, playerA, playerB) => Number(allMatchups.find(({ id, opp }) => playerA === id && playerB === opp)?.count || 0)

// Calculate single player's base score
const getPlayerScore = (stats) => !stats ? 0 :
  Object.keys(weight).reduce((tot,key) => tot + (key in stats && !isNaN(stats[key]) ? stats[key] * weight[key] : 0), 0)

// Calculate score of 2 players (base + rematch penalties)
const getComboScore = (scores, opps, allMatchups) => ([playerA, playerB]) =>
  diff(scores[playerA], scores[playerB]) + (count(playerB, opps?.[playerA]) + count(playerA, opps?.[playerB])) * weight.penalty
  + getMatchupCount(allMatchups, playerA, playerB) * weight.matchups

// Calculate score for single player match (base + bye penalties)
const getSoloScore = (player, score, byes) => score + count(player, byes) * weight.penalty * 2

// Helper function to check if a player can be paired (Algorithm B)
const canBePaired = (player, opponents = [], playerOpps = [], minCount = 0) => opponents.every((opp) =>
  opp !== player && playerOpps.filter((o) => o === opp).length === minCount
)

// Get minimum pairings, keyed by player
const getMinPairings = (oppData) => Object.keys(oppData).reduce((acc, player) => {
  acc[player] = Math.min(...Object.keys(oppData).map((opp) => oppData[player].filter((id) => id === opp).length))
  return acc
}, {})

// Get opponent with the least amount of previous matchups
const getMinMatchups = (match, opps, allMatchups) => {
  let minVal = Infinity, minOpp
  for (const opp of opps) {
    const count = match.reduce((sum, player) => sum + getMatchupCount(allMatchups, player, opp), 0)
    if (count < minVal) {
      minVal = count
      minOpp = opp
    }
  }
  return minOpp
}


// --- MAIN --- \\

function generateMatchups(stats, { playerspermatch, byes, oppData, allMatchups }) {
  // Randomize matches for initial pairing
  if (stats.noStats) return noStatsAlgorithm(stats.ranking, playerspermatch, allMatchups)
  
  // Pair with simpler algorithm if over threshold
  if (stats.ranking.length > pairingThreshold)
    return fastAlgorithm(stats, { playerspermatch, byes, oppData, allMatchups })
  
  return slowAlgorithm(stats, { playerspermatch, byes, oppData, allMatchups })
}

function slowAlgorithm(stats, { playerspermatch, byes, oppData, allMatchups }) {
  
  // Calculate base player scores
  const playerScores = stats.ranking.reduce((scores, player) => 
    Object.assign(scores, { [player]: getPlayerScore(stats[player]) }),
  {})
    
  // Iterate over all possible match groupings, finding the lowest score
  let bestMatch = null, bestScore = NaN
  for (const matchList of getGroups(stats.ranking, playerspermatch)) {
      const val = avg(matchList.map((match) =>
        // Bye match
      match.length === 1 ? getSoloScore(match[0], playerScores[match[0]], byes) :
      
      // Standard match (average out scores of each player pair)
      avg( [...getCombinations(match, 2)].map(getComboScore(playerScores, oppData, allMatchups || [])) )
    ))
    if (!isNaN(bestScore) && val >= bestScore) continue
    bestScore = val
    bestMatch = matchList
  }

  // Catch error
  if (!bestMatch) {
    console.error('SWISS MONRAD Input Data:', stats, { playerspermatch, byes, oppData })
    console.error('SWISS MONRAD Results:', resultsLogObject(stats, playerScores, bestScore))
    throw new Error('SWISS MONRAD failed to find best match pairing.')
  }

  return bestMatch
}

function noStatsAlgorithm(players, playerspermatch, allMatchups) {
  // If no data provided, do a completely random pairing
  if (!allMatchups?.length) return randomGroup(players)

  players = shuffle(players) // Randomize array initially

  // Pair players based on historical match data
  const remaining = new Set(players)
  const matches = []
  while (remaining.size) {
    // Start match with next player
    const match = [remaining.values().next().value]
    remaining.delete(match[0])
    // Add best matches until match is full or you run out of players
    while (match.length < playerspermatch && remaining.size) {
      const opp = getMinMatchups(match, remaining, allMatchups)
      match.push(opp)
      remaining.delete(opp)
    }
    if (match.length) matches.push(match)
  }

  return matches
}


function fastAlgorithm(stats, { playerspermatch, byes, oppData }) {
  const players = stats.ranking.slice()
  const matches = []
  const usedPlayers = new Set()
  const byePlayers = new Set(byes || [])

  // Calculate minimum values
  const minPairings = getMinPairings(oppData)

  // Generate matches
  while (usedPlayers.size < players.length) {
      const match = []
      for (let i = 0; i < playerspermatch; i++) {
          let player = null
          for (const candidate of players) {
              if (!usedPlayers.has(candidate) && !byePlayers.has(candidate) &&
                  (match.length === 0 || canBePaired(candidate, match, oppData[candidate], minPairings[candidate]))) {
                  player = candidate
                  break
              }
          }
          if (player === null) {
              // If no player found, assign a bye
              for (const candidate of players) {
                  if (!usedPlayers.has(candidate)) {
                      player = candidate
                      byePlayers.add(player)
                      break
                  }
              }
          }
          if (player !== null) {
              match.push(player)
              usedPlayers.add(player)
          }
      }
      // If the match is not full, find the best opponents for remaining spots
      while (match.length < playerspermatch) {
          let opponent = null
          for (const candidate of players) {
              if (!usedPlayers.has(candidate) && canBePaired(candidate, match, oppData[candidate], minPairings[candidate])) {
                  opponent = candidate
                  break
              }
          }
          if (opponent !== null) {
              match.push(opponent)
              usedPlayers.add(opponent)
          } else {
              break
          }
      }
      matches.push(match)
  }

  // Ensure all players appear exactly once
  if (usedPlayers.size !== players.length) {
      console.error('SWISS MONRAD Input Data:', stats, { playerspermatch, byes, oppData })
      console.error('SWISS MONRAD Results:', resultsLogObject(stats, playerScores, bestScore))
      console.error("Algorithm A failed, falling back on no pairing.")
      return getGroupsSimple(players, playerspermatch)
  }

  return matches;
}

module.exports = generateMatchups;



// ----- Logging ------ \\

// Get results as readable object for error reporting
const resultsLogObject = (stats, playerScores, bestScore) => ({
  bestScore, stats, playerScores,
  totalCount: stats.ranking.length,
})