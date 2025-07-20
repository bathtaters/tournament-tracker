// Services
const matchGen = require("./matchGenerators/swissMonrad");
const toStats = require("./stats.services");

// Builds data object representing a round
function round(eventData, matchData, oppData, allMatchups, autoReportByes) {
  // Increment round number & create return object
  const matchBase = {
    round: Math.min(eventData.roundactive, eventData.roundcount) + 1,
    eventid: eventData.id,
  };

  // Event has ended
  if (matchBase.round == eventData.roundcount + 1) return matchBase;

  // Collect data for match generator
  let stats = eventData.roundactive
    ? toStats(
        { solo: matchData },
        eventData.players,
        { solo: oppData },
        true,
        true
      )
    : { ranking: eventData.players, noStats: true };
  if (!stats.ranking) stats.ranking = [];
  if (eventData.drops)
    stats.ranking = stats.ranking.filter((p) => !eventData.drops.includes(p));

  // Generate match table (Can add more alogrithms later)
  const matchTable = matchGen(stats, { ...eventData, oppData, allMatchups });

  // Format for DB write (auto-reporting byes)
  const byeWins = autoReportByes ? eventData.wincount : 0;
  return {
    ...matchBase,

    matches: matchTable.map((match) => ({
      ...matchBase,
      players: match,
      wins: match.map(() => (match.length === 1 ? byeWins : 0)),
      reported: autoReportByes && match.length === 1,
    })),
  };
}

module.exports = round;
