// Format data for display

export const formatQueryError = (err) => 'ERROR: '+JSON.stringify(err);

export const formatMatchTitle = (matchPlayers, playerData) =>
  matchPlayers.map(id => (playerData[id] && playerData[id].name) || '?').join(' vs. ');

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+(record || ['','']).join(' - ')+(braces?' ]':'');

export const formatNum = (num) => num == null ? '-' : num;

export const formatPercent = (decimal) => decimal == null ? '- %' : (Math.round(decimal * 1000) / 10) + '%';