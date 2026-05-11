// Build a playerid list from rank (Include missing players if listAll=true)
import type { Player, Team, TeamType } from "types/models";

const withMembers = (
  team: Team,
  players: Record<Player["id"], Player>,
): Team & { members: Player[] } => ({
  ...team,
  members: team.players.map((id) => players[id] ?? { id, name: "" }),
});

/** Get player data or team with "Members" array appended to it.
 *  For DISTRIB events, also returns the team the player belongs to. */
export const getPlayerOrTeam = (
  id: Player["id"] | Team["id"],
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team>,
  eventTeam?: TeamType,
): { player?: Player; team?: Team & { members: Player[] } } => {
  if (teams[id]) return { team: withMembers(teams[id], players) };
  const player = players[id] ?? { id, name: "" };
  if (eventTeam !== "DISTRIB" || !teams) return { player };
  const owner = Object.values(teams).find((t) => t.players?.includes(id));
  return owner ? { player, team: withMembers(owner, players) } : { player };
};

export const getPlayerList = (
  ranking: Player["id"][],
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team> = {},
  listAll = false,
  hideHidden = false,
) => {
  if (!players) return ranking || [];

  let list = ranking
    ? ranking.filter((p) => p in players || p in teams)
    : listAll
      ? Object.keys(players)
      : [];

  if (listAll && ranking)
    list.push(...Object.keys(players).filter((p) => !ranking.includes(p)));

  return hideHidden ? list.filter((p) => !players[p].hide) : list;
};
