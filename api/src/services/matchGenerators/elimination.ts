import type { GenerateData, Stats } from "types/generators";
import type { Event, EventDetail, Match, MatchDetail } from "types/models";
import noStatsAlgorithm from "./noStats";
import { getOrderedGroup, invertArrayObj } from "./matchGen.utils";

export default function generateMatchups(
  stats: Stats,
  { playerspermatch, byes, teamData, allMatchups }: GenerateData,
  lastRoundMatches: MatchDetail[],
): Match["players"][] {
  // Initial pairing
  if (!stats.ranking?.length || lastRoundMatches.length < 1)
    return noStatsAlgorithm(
      stats.ranking,
      playerspermatch,
      allMatchups,
      teamData,
    );

  // Generate pairings with remaining players
  const players = lastRoundMatches.flatMap(({ players }) =>
    players.filter((id) => stats.ranking.includes(id)),
  );

  const matchTable = getOrderedGroup(players, playerspermatch, teamData);

  // Check if there is a repeat bye
  const lastMatch = matchTable[matchTable.length - 1];
  if (lastMatch.length !== 1 || !byes?.includes(lastMatch[0]))
    return matchTable;

  // Swap with the last player to not have any byes
  const teamMap = teamData && invertArrayObj(teamData),
    byePlayer = lastMatch[0];
  for (let playerIdx = players.length - 1; playerIdx >= 0; playerIdx--) {
    // Skip over the byePlayer and players that have already had byes
    const swapPlayer = players[playerIdx];
    if (swapPlayer === byePlayer || byes?.includes(swapPlayer)) continue;

    const byeTeam = teamMap?.[byePlayer],
      swapMatch = matchTable.find((match) =>
        match.some((player) => player === swapPlayer),
      );

    // If swapPlayer's match satisfies team constraints, then swap them into the bye slot
    if (
      !byeTeam ||
      swapMatch.every(
        (player) => player === swapPlayer || teamMap[player] !== byeTeam,
      )
    ) {
      swapMatch[swapMatch.indexOf(swapPlayer)] = byePlayer;
      lastMatch[0] = swapPlayer;
      return matchTable;
    }
  }

  // If no adequate replacement was found, and byePlayer didn't have a bye last round, then use these pairings
  if (
    lastRoundMatches.find(({ players }) => players.includes(byePlayer)).players
      .length !== 1
  )
    return matchTable;

  // Otherwise, shift the byePlayer to the start and redo pairings (Skipping any 'bye' fixes)
  players.unshift(players.splice(players.indexOf(byePlayer), 1)[0]);
  return getOrderedGroup(players, playerspermatch, teamData);
}

/** Get players to eliminate formatted for updateMatch() */
export function getEliminated(
  event: EventDetail,
  matches: MatchDetail[],
  stats: Stats,
) {
  // First round, no eliminations
  if (stats.noStats) return [];

  // Eliminate the bottom half of players in each match
  let eliminated: Pick<Match, "id" | "drops">[] = [];
  for (const match of matches) {
    if (match.round !== event.roundactive || match.players.length < 2) continue;

    const eliminateIndex = Math.ceil(match.players.length / 2);
    const sortedPlayers = stats.ranking.filter(
      (player) =>
        match.players.includes(player) && !match.drops.includes(player),
    );

    if (eliminateIndex < sortedPlayers.length)
      eliminated.push({
        id: match.id,
        drops: sortedPlayers.slice(eliminateIndex),
      });
  }

  return eliminated;
}

/** Get the total number of rounds required for an elimination match. */
export function getRoundCount(event: Event) {
  const eliminatePerMatch = Math.floor(event.playerspermatch / 2);
  if (!eliminatePerMatch) return 1;

  // Simulate rounds until 1 player remains
  let playerCount = event.players.length,
    roundCount = 0;

  while (playerCount > 1) {
    const fullMatches = Math.floor(playerCount / event.playerspermatch);
    const remainderEliminate = Math.floor(
      (playerCount % event.playerspermatch) / 2,
    );
    if (fullMatches === 0 && remainderEliminate === 0) break;

    playerCount -= fullMatches * eliminatePerMatch - remainderEliminate;
    roundCount++;
  }
  return roundCount;
}
