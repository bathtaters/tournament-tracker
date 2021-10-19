// Strings

export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const formatMatchTitle = (matchPlayers, playerData) =>
  Object.keys(matchPlayers).map(id => playerData[id].name).join(' vs. ');

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+record.join(' - ')+(braces?' ]':'');
