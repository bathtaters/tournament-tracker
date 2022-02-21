// Get W/L/D record & isDrop from match data
export function getMatchData(matches, playerId) {
  if (!matches) return matches;

  console.log('PLAYER_MATCHES-orig',playerId,matches);
  for (const event in matches) {
    const data = { record: [0, 0, 0], isDrop: false };
    matches[event].forEach(match => {
      // Check if dropped
      if (match.drops.includes(playerId)) data.isDrop = true;

      const playerIdx = match.players.indexOf(playerId);
      if (playerIdx === -1) return; // doesn't have player

      if (match.isDraw) data.record[2]++; // draw
      else if (match.wins[playerIdx] === match.maxwins) data.record[0]++; // win
      else data.record[1]++; // loss
    });
    matches[event] = data;
  }
  return matches;
}