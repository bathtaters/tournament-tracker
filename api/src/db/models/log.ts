/* *** LOG Operations *** */
import type { Request } from "express";
import type { PoolClient } from "pg";
import type { Event, LogEntry, LogEntryAdd, Player } from "types/models";
import type { TableName } from "types/base";
import { sqlSub } from "../../utils/dbInterface.utils";
import { arrToObj } from "../../utils/shared.utils";
import * as db from "../admin/interface";
import {
  AddOptions,
  MultiUpdateOptions,
  UpdateOptions,
} from "../admin/interface";
import { log as qry, TimeRange } from "../sql/strings";
import { enums } from "../../config/validation";

const { TableName, LogAction } = enums;

// Maximum number of LOG entries to return at a time if not specified
const DEFAULT_LIMIT = 100;

/** Use as Request for log functions when executed by the system */
export const SYSTEM_ID = "_SYSTEM_";
export const SYSTEM_REQ = { sessionID: SYSTEM_ID } as Request;

/** Simplify Request object for use with log functions */
export const simpleReq = ({
  sessionID,
  session,
}: Pick<Request, "sessionID" | "session">) => ({
  sessionID,
  session: { user: session?.user },
});

/**
 * Get all log entries, optionally filtering by range/table/success
 * @param timeRange - Time period to return entries within
 * @param tables - Only return entries for these tables
 * @param inclFailed - If true include changes that did not succeed
 * @param limit - Maximum number of entries to return (0 to return all, Default: 100)
 * @param offset - Offset of first entry returned (Default: 0)
 * @returns - A list of matching log entries (Sorted from latest to oldest)
 */
export const get = (
  timeRange: TimeRange,
  tables: TableName[] | null = null,
  inclFailed = false,
  limit = DEFAULT_LIMIT,
  offset = 0,
) =>
  db.getRows<LogEntry>(
    "log",
    ...qry.logFilter(tables, timeRange, inclFailed),
    null,
    limit,
    offset,
  );

/**
 * Get all entries pertaining to a specific event (Event + Match)
 * @param eventid - ID of Event to lookup entries for
 * @param timeRange - Time period to return entries within
 * @param inclFailed - If true include changes that did not succeed
 * @param limit - Maximum number of entries to return (0 to return all, Default: 100)
 * @param offset - Offset of first entry returned (Default: 0)
 * @returns - A list of matching log entries (Sorted from latest to oldest)
 */
export const getEvent = (
  eventid: Event["id"],
  timeRange: TimeRange,
  inclFailed = false,
  limit = DEFAULT_LIMIT,
  offset = 0,
) => {
  let [sqlFilter, sqlArgs] = qry.logFilter(
    [TableName.EVENT, TableName.MATCH],
    timeRange,
    inclFailed,
    [eventid],
  );
  return db.getRows<LogEntry>(
    "log",
    qry.matchesFilter(sqlFilter),
    sqlArgs,
    null,
    limit,
    offset,
  );
};

/**
 * Get all entries pertaining to a specific player (Player + Voter)
 * @param playerid - ID of Player to lookup entries for
 * @param timeRange - Time period to return entries within
 * @param inclFailed - If true include changes that did not succeed
 * @param limit - Maximum number of entries to return (0 to return all, Default: 100)
 * @param offset - Offset of first entry returned (Default: 0)
 * @returns - A list of matching log entries (Sorted from latest to oldest)
 */
export const getPlayer = (
  playerid: Player["id"],
  timeRange: TimeRange,
  inclFailed = false,
  limit = DEFAULT_LIMIT,
  offset = 0,
) =>
  db.getRows<LogEntry>(
    "log",
    ...qry.logFilter(
      [TableName.PLAYER, TableName.VOTER],
      timeRange,
      inclFailed,
      [playerid],
    ),
    "*",
    limit,
    offset,
  );

/**
 * Get all entries created by a specific user
 * @param userid - ID of User to lookup entries created by
 * @param timeRange - Time period to return entries within
 * @param tables - Only return entries for these tables
 * @param inclFailed - If true include changes that did not succeed
 * @param limit - Maximum number of entries to return (0 to return all, Default: 100)
 * @param offset - Offset of first entry returned (Default: 0)
 * @returns - A list of matching log entries (Sorted from latest to oldest)
 */
export const getUser = (
  userid: Player["id"],
  timeRange: TimeRange,
  tables: TableName[] | null = null,
  inclFailed = false,
  limit = DEFAULT_LIMIT,
  offset = 0,
) =>
  db.getRows<LogEntry>(
    "log",
    ...qry.logFilter(tables, timeRange, inclFailed, null, [userid]),
    "*",
    limit,
    offset,
  );

/**
 * Get all unique users for a given session ID.
 * @param filter - Only lookup related session or user (If both provided, looks up user)
 * @returns - If userid provided,
 */
export const getUserSessions = async ({
  userid,
  sessionid,
}: { userid?: string; sessionid?: string } = {}) => {
  if (userid) {
    const res = await db.query<UserSessions>(
      `${qry.userSessions} ${qry.userFilter};`,
      [userid],
    );
    return res.flatMap(({ sessionids }) => sessionids);
  } else if (sessionid) {
    const res = await db.query<UserSessions>(
      `${qry.userSessions} ${qry.sessionFilter};`,
      [sessionid],
    );
    return res.map(({ userid }) => userid);
  }
  const res = await db.query<UserSessions>(
    `${qry.userSessions} ${qry.nonNullFilter};`,
  );
  return arrToObj("userid", { valKey: "sessionids" })(res) as Record<
    UserSessions["userid"],
    UserSessions
  >;
};

/**
 * Add one or more entries to the log
 * @param entries - One entry or a list of entries to add
 * @param req - Request object to extract user and session IDs
 * @param newlyDeletedUsers - List of recently deleted user IDs
 * @returns - List of new log entries
 */
export const addEntries = (
  entries: LogEntryAdd[],
  req?: Request,
  newlyDeletedUsers: Player["id"][] = [],
) => {
  if (!Array.isArray(entries)) entries = entries ? [entries] : [];
  if (req)
    entries = entries.map((entry) => ({
      ...entry,
      userid: entry.userid || req.session?.user || null,
      sessionid: entry.sessionid || req.sessionID || null,
    }));
  if (newlyDeletedUsers)
    entries.forEach((entry) => {
      // Fixes error when user deletes themselves
      if (newlyDeletedUsers.includes(entry.userid)) entry.userid = null;
    });
  return db.addRows<LogEntry>("log", entries);
};

/**
 * Delete one or more entries from the log
 * @param ids - One ID or a list of IDs to delete
 * @returns List of deleted log entries
 */
export const rmvEntries = (ids: LogEntry["id"][]) =>
  Promise.all(ids.map((id) => db.rmvRow<LogEntry>("log", id)));

// -- ENTRY OBJECTS -- \\

/** Same as db.addRows, also creates a log entry
 * (objArray may also be a single object to use addRow). */
export const addRows = async <T extends Record<string, any>>(
  dbtable: TableName,
  objArray: Partial<T>[],
  req: Request,
  { tableid, ...options }: AddOptions<T> & { tableid?: string } = {},
) => {
  try {
    const entries = await db.addRows<T>(dbtable, objArray, options);

    if (entries?.length)
      await addEntries(
        entries.map((data) => ({
          dbtable,
          data:
            dbtable === TableName.SETTINGS && data.value
              ? { value: data.value }
              : data,
          tableid: data.id ?? tableid,
          action: options.upsert ? LogAction.UPSERT : LogAction.CREATE,
        })),
        req,
      );
    else
      await addEntries(
        (Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
          dbtable,
          data:
            dbtable === TableName.SETTINGS && data.value
              ? { value: data.value }
              : data,
          tableid: data.id ?? tableid,
          action: options.upsert ? LogAction.UPSERT : LogAction.CREATE,
          error: "No return from insert operation.",
        })),
        req,
      );
    return entries;
  } catch (error) {
    await addEntries(
      (Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
        dbtable,
        data:
          dbtable === TableName.SETTINGS && data.value
            ? { value: data.value }
            : data,
        tableid: data.id ?? tableid,
        action: options.upsert ? LogAction.UPSERT : LogAction.CREATE,
        error: error?.message || error?.toString() || "Unknown error",
      })),
      req,
    );
    throw error;
  }
};

/** Same as db.updateRows, also creates a log entry
 * (objArray may also be a single obj w/ rowId to use updateRow). */
export const updateRows = async <T extends Record<string, any>>(
  dbtable: TableName,
  rowId: T["id"] | null,
  objArray: Partial<T> | Partial<T>[],
  req?: Request,
  options: UpdateOptions<T> | MultiUpdateOptions<T> = {},
) => {
  const idCol = options.idCol ?? "id";
  try {
    let res: T[];
    if (Array.isArray(objArray))
      res = await db.updateRows<T>(dbtable, objArray, options);
    else res = await db.updateRow<T>(dbtable, rowId, objArray, options);

    await addEntries(
      (Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
        dbtable,
        data,
        tableid: data[idCol] ?? (res as any)?.[idCol] ?? rowId,
        action: LogAction.UPDATE,
        error:
          res && res.length !== 0
            ? null
            : "No return from update operation. Most likely no rows were found.",
      })),
      req,
    );
    return res;
  } catch (error) {
    await addEntries(
      (Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
        dbtable,
        data,
        tableid: data[idCol] ?? rowId,
        action: LogAction.UPDATE,
        error: error?.message || error?.toString() || "Unknown error",
      })),
      req,
    );
    throw error;
  }
};

/** Same as db.rmvRows, also creates a log entry
 *  (idOrArgs may also be a rowId and no sqlFilter provided to use rmvRow). */
export const rmvRows = async <T extends Record<string, any>>(
  dbtable: TableName,
  idOrArgs: T["id"] | any[],
  sqlFilter?: string,
  req?: Request,
  client?: PoolClient,
) => {
  try {
    let entries: T[];
    if (!sqlFilter && idOrArgs && !Array.isArray(idOrArgs)) {
      entries = await db
        .rmvRow<T>(dbtable, idOrArgs, client)
        .then((r) => (r ? [r] : []));
    } else {
      entries = await db.rmvRows<T>(dbtable, sqlFilter, idOrArgs, client);
    }

    if (entries?.length)
      await addEntries(
        entries.map((data) => ({
          dbtable,
          data,
          tableid: data.id,
          action: LogAction.DELETE,
        })),
        req,
        entries.map(({ id }) => id),
      );
    else
      await addEntries(
        [
          {
            dbtable,
            tableid: sqlFilter ? sqlSub(sqlFilter, idOrArgs) : idOrArgs,
            action: LogAction.DELETE,
            error:
              "No return from delete operation. Most likely no rows were found.",
          },
        ],
        req,
      );
    return entries;
  } catch (error) {
    await addEntries(
      [
        {
          dbtable,
          tableid: sqlFilter ? sqlSub(sqlFilter, idOrArgs) : idOrArgs,
          action: LogAction.DELETE,
          error: error?.message || error?.toString() || "Unknown error",
        },
      ],
      req,
    );
    throw error;
  }
};

/**
 * Same as db.query, also creates a log entry
 * @param text - SQL text (w/ $ placeholders).
 * @param args - Arguments to substitute for placeholders in text.
 * @param logMap - Convert result data or an error to a LogEntry
 * @param req - Request object to extract user and session IDs
 * @param client - DB Client Connection to use instead of default.
 * @returns Result of query
 */
export async function query<T extends Record<string, any>>(
  text: string,
  args: any[] = [],
  logMap?: LogEntryFactory<T>,
  req?: Request,
  client?: PoolClient,
) {
  try {
    const res = await db.query<T>(text, args, client);
    if (!logMap) return res; // No log entry

    if (res?.length) {
      await addEntries(
        res.flatMap((data) => logMap(data)),
        req,
      );
    } else {
      const entry = logMap(
        null,
        "No result from DB operation. Most likely because no matches were found.",
      );
      await addEntries(Array.isArray(entry) ? entry : [entry], req);
    }
    return res;
  } catch (error) {
    if (logMap) {
      const entry = logMap(
        null,
        error?.message || error?.toString() || "Unknown error",
      );
      await addEntries(Array.isArray(entry) ? entry : [entry], req);
    }
    throw error;
  }
}

/**
 * Simple logging for password attempts
 * @param userid - User ID extracted from Request object (req.session.user)
 * @param sessionid - Session ID extracted from Request object (req.sessionID)
 * @param error - Error message from the login attempt (Or null if login was successful)
 * @param name - Name of user attempting to log in
 * @returns
 */
export const login = (
  userid?: Player["id"],
  sessionid?: Player["session"],
  error?: string,
  name?: string,
) =>
  addEntries([
    {
      dbtable: TableName.PLAYER,
      action: LogAction.LOGIN,
      data: error ? null : { success: true },
      tableid: name || userid,
      userid,
      sessionid,
      error,
    },
  ]).then(() => error);

type UserSessions = { userid: string; sessionids: string[] };

type LogEntryFactory<T extends Record<string, any>> = (
  data: T,
  error?: string,
) => LogEntryAdd[] | LogEntryAdd;
