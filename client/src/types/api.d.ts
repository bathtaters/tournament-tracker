import type { MatchData, Player, Settings, EventDay } from "./models";
import type { SwapDragData } from "./base";

// API Body types

export type GetScheduleBody = {
  schedule: Record<EventDay["day"], EventDay>;
  settings: Pick<
    Settings,
    | "dayslots"
    | "datestart"
    | "dateend"
    | "planslots"
    | "plandates"
    | "planschedule"
  >;
};

export type PlanStatus = {
  planstatus?: number;
  planprogress?: number;
  error?: string;
};

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
