/* *** MATCH Object *** */
import type { Request } from "express";
import type { Event, Match, MatchDetail, Player } from "types/models";
import type { MatchupData } from "types/generators";
import { getRow, getRows, operation } from "../admin/interface";
import { addEntries, query, updateRows } from "./log";
import { match as strings } from "../sql/strings";
import { filtering } from "../../utils/shared.utils";
import { enums } from "../../config/validation";

const { TableName, LogAction } = enums;

// Match Table Operations //

// Get match base or match detail
export function get(
  matchId: Match["id"],
  detail?: false,
  fields?: (keyof Match)[],
): Promise<Match | undefined>;
export function get(
  matchId: Match["id"],
  detail: true,
  fields?: (keyof MatchDetail)[],
): Promise<MatchDetail | undefined>;
export function get(
  matchId: Match["id"],
  detail = false,
  fields?: (keyof Match | keyof MatchDetail)[],
): Promise<Match | MatchDetail | undefined> {
  return getRow(detail ? "matchdetail" : "match", matchId, fields as any[]);
}

export function getMulti(
  matchIds: Match["id"][],
  detail?: false,
  fields?: (keyof Match)[],
): Promise<Match[]>;
export function getMulti(
  matchIds: Match["id"][],
  detail: true,
  fields?: (keyof MatchDetail)[],
): Promise<MatchDetail[]>;
export function getMulti(
  matchIds: Match["id"][],
  detail = false,
  fields?: (keyof Match | keyof MatchDetail)[],
) {
  return operation((client) =>
    Promise.all(
      matchIds.map((id) =>
        getRow<Match | MatchDetail>(
          detail ? "matchdetail" : "match",
          id,
          fields as any[],
          { client },
        ),
      ),
    ),
  ) as Promise<Match[] | MatchDetail[]>;
}

// Get a list of player IDs w/ their match frequency (vars: id, opp, count)
export const getMatchups = (eventId: Event["id"]) =>
  query<MatchupData>(strings.allCounts, [eventId]);

// Get list of IDs only
export const listByEvent = (eventid?: Event["id"]) =>
  query<{
    eventid: Match["eventid"];
    round: Match["round"];
    matches: Match["id"][];
  }>(eventid ? strings.list : strings.listAll, eventid ? [eventid] : []);

// Get detail from each match
export const getByEvent = (eventid: Event["id"]) =>
  getRow<MatchDetail>("matchdetail", eventid, "*", {
    idCol: "eventid",
    getOne: false,
  });

// Get all match details for stats
export const getAll = (completed = true) =>
  getRows<MatchDetail>(
    "matchdetail",
    completed ? strings.complete : undefined,
    [],
    completed ? "matchDetail.*" : "*",
  );

// Drop/Undrop player from match
export const dropPlayer = (
  id: Match["id"],
  player: Player["id"],
  drop: boolean,
  req?: Request,
) =>
  query<Match>(
    drop ? strings.drop : strings.undrop,
    [id, player],
    (data, error) =>
      error
        ? {
            dbtable: TableName.MATCH,
            action: LogAction.UPDATE,
            tableid: id,
            data: { [`drop.${drop ? "push" : "pop"}`]: player },
            error,
          }
        : {
            dbtable: TableName.MATCH,
            action: LogAction.UPDATE,
            tableid: data.id,
            data: { drops: data.drops },
          },
    req,
  ).then((r) => r?.[0]);

// Update match data (Providing match.player will overwrite entire object)
export const update = (
  id: Match["id"],
  newData: Partial<Omit<Match, "id">>,
  req?: Request,
) => updateRows<Match>("match", id, newData, req);

export const updateMulti = (
  dataArray: (Partial<Match> & Pick<Match, "id">)[],
  req: Request,
) =>
  operation((client) =>
    Promise.all(
      dataArray.map((data) =>
        data.id
          ? updateRows<Match>("match", data.id, filtering(data, ["id"]), req, {
              client,
            }).then((r) => r?.[0])
          : addEntries(
              [
                {
                  dbtable: TableName.MATCH,
                  action: LogAction.UPDATE,
                  data,
                  error: "No ID provided",
                },
              ],
              req,
            ).then(() => ({ ...data, error: "No ID provided" })),
      ),
    ),
  );

// Update match.wins only
export const updateWins = async (
  id: Match["id"],
  index: number,
  wins: number,
  req: Request,
) => {
  // Get
  const data = await getRow<Match>("match", id, ["eventid", "wins"]);
  if (!data || !data.wins) return data;
  // Set
  data.wins[index] = wins;
  return updateRows<Match>("match", id, { wins: data.wins }, req).then(
    (r) => r?.[0],
  );
};
// This can replace the above function but doesn't work in CockroachDB:
// updateRows('match', id, { [`wins[${index+1}]`]: wins }, req);
