import type { MatchData, Player } from "./models";
import type { SwapDragData } from "./base";

// API Body types

export type UpdateMatchKey =
  | "wins"
  | "drops"
  | "draws"
  | `${"wins" | "drops"}.${number}`;

export type UpdateMatchBody = {
  id: MatchData["id"];
  eventid: MatchData["eventid"];
  key: UpdateMatchKey;
  value?:
    | MatchData["wins" | "drops" | "draws"]
    | MatchData["wins" | "drops"][number];
};

export type UpdateDropBody = {
  id: MatchData["id"];
  eventid: MatchData["eventid"];
  playerid: Player["id"];
  undrop?: boolean;
};

export type SwapPlayerBody = {
  eventid: MatchData["eventid"];
  swap: [SwapDragData, SwapDragData];
  id?: MatchData["id"];
};
