import type { EventData, Player, Team } from "types/models";

/** Convert regular teams array to an EventID to Teams (w/ Members array) map. */
export function convertTeams(
  playerId: Player["id"],
  eventList: EventData["id"][],
  teams: Record<Team["id"], Team>,
  events: Record<EventData["id"], EventData>,
  players: Record<Player["id"], Player>,
) {
  const teamMap = {} as Record<EventData["id"], Team & { members: Player[] }>;

  for (const eventId of eventList) {
    if (!events[eventId]?.team) continue;
    const teamId = events[eventId].players.find((tid) =>
      teams[tid]?.players?.includes(playerId),
    );
    if (!teamId || !teams[teamId]) continue;

    teamMap[eventId] = {
      ...teams[teamId],
      members: teams[teamId].players
        .map((playerId) => players[playerId])
        .filter((p) => p && !p.hide),
    };
  }
  return teamMap;
}
