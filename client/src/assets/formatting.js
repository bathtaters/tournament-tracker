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