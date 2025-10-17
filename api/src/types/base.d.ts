import { enums } from "config/validation";

export type TableName = (typeof enums.TableName)[keyof typeof enums.TableName];
export type LogAction = (typeof enums.LogAction)[keyof typeof enums.LogAction];
export type EventFormat = keyof typeof enums.EventFormat;
export type TeamType = keyof typeof enums.TeamType;

export type ClockState = "run" | "reset" | "pause";

export type SettingsType =
  | "string"
  | "bigint"
  | "number"
  | "date"
  | "boolean"
  | "object"
  | "symbol"
  | "undefined"
  | "function";

export type Settings = {
  id: string;
  title: string;
  showrawjson: boolean;
  autofillsize: number;
  autobyes: boolean;
  dayslots: number;
  datestart: Date;
  dateend: Date;
  planstatus: number;
  plandates: Date[];
  planslots: number;
  planmenu: boolean;
  planschedule: boolean;
  showcredits: boolean;
  showstandings: boolean;
};

export type PlayerRecord = [win: number, loss: number, draw: number];
