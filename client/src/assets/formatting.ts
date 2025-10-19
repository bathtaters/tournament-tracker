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
  id: Player["id"] | Team["id"],
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team>,
): Partial<Pick<Player, "name" | "hide">> => {
  if (id in players) return players[id] ?? {};
  if (id in teams && teams[id].name == null)
    return {
      ...teams[id],
      name: teams[id].players.map((pid) => players[pid]?.name ?? "?").join("/"),
    };
  return teams[id] ?? {};
};

export const formatMatchTitle = (
  matchPlayers: MatchData["players"],
  playerData: Record<Player["id"], Player>,
) =>
  matchPlayers
    .map((id) => (playerData[id] && playerData[id].name) || "?")
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
