// Get W/L/D record & isDrop from match data
export function getMatchData(matches, playerId) {
  if (!matches) return matches;

  let result = {};
  for (const event in matches) {
    result[event] = { record: [0, 0, 0], isDrop: false };

    matches[event].forEach(match => {
      // Check if dropped
      if (match.drops.includes(playerId)) result[event].isDrop = true;

      const playerIdx = match.players.indexOf(playerId);
      if (playerIdx === -1) return; // doesn't have player

      if (match.isDraw) result[event].record[2]++; // draw
      else if (match.wins[playerIdx] === match.maxwins) result[event].record[0]++; // win
      else result[event].record[1]++; // loss
    });
  }
  return result;
}