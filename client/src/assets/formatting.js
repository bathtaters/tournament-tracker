// Format data for display

export const basicTemplate = (statics, ...dictKeys) => (dict = {}) => 
  dictKeys.reduce((string, key, i) => string + (dict[key] ?? key) + statics[i + 1], statics[0])

export const formatQueryError = (err) => 'Please refresh page'

export const formatMatchTitle = (matchPlayers, playerData) =>
  matchPlayers.map(id => (playerData[id] && playerData[id].name) || '?').join(' vs. ');

export const formatMatchStatus = (statusLabel, isDrop) => isDrop ? `Dropped (${statusLabel})` : statusLabel

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+(record || ['','']).join(' - ')+(braces?' ]':'');

export const formatNum = (num) => num == null ? '-' : num;

export const formatPercent = (decimal) => decimal == null ? '- %' : (Math.round(decimal * 1000) / 10) + '%';

// Copy Round format
export const formatCopyRound = (matchList, matches, players) => matchList.map(
  (matchId) => matches[matchId]?.players.map(
    // Names
    (playerId, idx) => players[playerId]?.name
      // Wins
      + (matches[matchId].reported ? ` (${matches[matchId].wins?.[idx]})` : '')
  ).join(' vs. ')
  // Draws
    + (!matches[matchId]?.draws || !matches[matchId].reported ? '' :
      ` (+${matches[matchId].draws} draw${matches[matchId].draws > 1 ? 's' : ''})`)
).join('\n')

export const formatCopySeats = (matchList, matches, players, playerspermatch) => {
  const playerList = []
  for (let p = 0; p < playerspermatch; p++) {
    for (const matchId of matchList) {
      const playerId = matches[matchId]?.players?.[p]
      playerList.push(players?.[playerId]?.name)
    }
  }
  return playerList.map((name, idx) => `${idx+1}. ${name ?? '[Empty]'}`).join('\n')
}