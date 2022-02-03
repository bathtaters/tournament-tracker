// Utilities replacing API calls for API-less testing

export const newId = (prefix, existing = null) => {
  if (!existing) existing = [];
  if (!Array.isArray(existing)) existing = Object.keys(existing);
  for (let i = 1; i < 100; i++) {
    if (!existing.includes(prefix+i))
      return prefix+i;
  }
  return null;
};

export const getPlayer = (playerInfo,existingPlayers) => {
  const playerid = newId(
    (playerInfo.name ? playerInfo.name.trim().charAt(0).toLowerCase() : 'x') + 'x',
    existingPlayers
  );
  if (!playerInfo.record) playerInfo.record = [0,0,0];
  return [playerid, playerInfo];
};

export const newEvent = (id, players) => ({
  id, draws: 0, reported: false,
  players: players.reduce((p,pid)=>({...p, [pid]: 0}),{}),
});

export const newRound = (playerids, eventid, roundNum) => {
  let round = [];
  const e = Math.ceil(playerids.length / 2);
  for (let i = 0; i < e; i++) {
    round.push(newEvent(eventid+'m'+roundNum+(i+1), playerids.slice(i * 2, i * 2 + 2)));
  }
  return round;
};


export const eventStatus = event => !event ? 0 : event.isDone ? 3 : event.matches && event.matches.length ? 2 : 1;