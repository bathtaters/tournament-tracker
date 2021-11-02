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
  const playerId = newId(
    (playerInfo.name ? playerInfo.name.trim().charAt(0).toLowerCase() : 'x') + 'x',
    existingPlayers
  );
  if (!playerInfo.record) playerInfo.record = [0,0,0];
  return [playerId, playerInfo];
};

export const newDraft = (id, players) => ({
  id, draws: 0, reported: false,
  players: players.reduce((p,pid)=>({...p, [pid]: 0}),{}),
});

export const newRound = (playerIds, draftId, roundNum) => {
  let round = [];
  const e = Math.ceil(playerIds.length / 2);
  for (let i = 0; i < e; i++) {
    round.push(newDraft(draftId+'m'+roundNum+(i+1), playerIds.slice(i * 2, i * 2 + 2)));
  }
  return round;
};

