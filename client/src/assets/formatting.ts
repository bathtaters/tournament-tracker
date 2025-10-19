// Format data for display
import {
  EventData,
  MatchData,
  Player,
  PlayerRecord,
  Team,
} from "../types/models";
import { debugLogging } from "./config";

export const formatQueryError = (err: any) =>
  debugLogging
    ? String(err?.message || err || "Unknown error")
    : "Please refresh page";

export const formatTeamName = (
  team: (Team & { members?: Player[] }) | undefined,
  players?: Record<Player["id"], Player>,
) => {
  if (!team || team.name) return team?.name;

  const members = team.members
    ? team.members
    : players
      ? team.players.map((id) => players[id])
      : [];

  return (
    members
      .filter((p) => p?.name && !p.hide)
      .map(({ name }) => name)
      .join("/") || undefined
  );
};

export const formatMatchTitle = (
  matchPlayers: MatchData["players"],
  playerData: Record<Player["id"], Player>,
  teamData: Record<Team["id"], Team>,
) =>
  matchPlayers
    .map(
      (id) =>
        playerData[id]?.name || formatTeamName(teamData[id], playerData) || "?",
    )
    .join(" vs. ");

export const formatMatchStatus = (statusLabel: string, isDrop = false) =>
  isDrop ? `Dropped (${statusLabel})` : statusLabel;

export const formatRecord = (record: PlayerRecord, braces = true) =>
  (braces ? "[ " : "") +
  (record || ["", ""]).join(" - ") +
  (braces ? " ]" : "");

export const formatPercent = (decimal: number) =>
  decimal == null ? "- %" : Math.round(decimal * 1000) / 10 + "%";

// Copy Round format
export const formatCopyRound = (
  matchList: MatchData["id"][],
  matches: Record<MatchData["id"], MatchData>,
  players: MatchData["players"],
) =>
  matchList
    .map(
      (matchId) =>
        matches[matchId]?.players
          .map(
            // Names
            (playerId, idx) =>
              players[playerId]?.name +
              // Wins
              (matches[matchId].reported
                ? ` (${matches[matchId].wins?.[idx]})`
                : ""),
          )
          .join(" vs. ") +
        // Draws
        (!matches[matchId]?.draws || !matches[matchId].reported
          ? ""
          : ` (+${matches[matchId].draws} draw${matches[matchId].draws > 1 ? "s" : ""})`),
    )
    .join("\n");

export const formatCopySeats = (
  matchList: MatchData["id"][],
  matches: Record<MatchData["id"], MatchData>,
  players: MatchData["players"],
  playerspermatch: EventData["playerspermatch"],
) => {
  const playerList = [];
  for (let p = 0; p < playerspermatch; p++) {
    for (const matchId of matchList) {
      const playerId = matches[matchId]?.players?.[p];
      if (playerId) playerList.push(players?.[playerId]?.name);
    }
  }
  return playerList
    .map((name, idx) => `${idx + 1}. ${name ?? "[Empty]"}`)
    .join("\n");
};
