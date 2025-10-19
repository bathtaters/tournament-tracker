/* *** SIMPLE SQL UI *** */
import type { PoolClient } from "pg";
import type { TableName } from "types/base";
import logger from "../../utils/log.adapter";
import {
  execFiles,
  operation as directOp,
  query as multiQuery,
} from "./directOps";
import { queryLabels, queryValues } from "../../utils/dbInterface.utils";

export { multiQuery };

// Key to use for joined update table in UpdateRows
const UPDATE_KEY = "upd";

// Error value for UpdateRow
const MISSING_ENTRY = { error: "Missing return value." } as const;

/**
 * Run a custom SQL query on the database.
 * @param text - SQL statement, using '$' placeholders.
 * @param args - Arguments to replace '$' placeholders in query text
 * @param client - If provided, use this PoolClient,
 *    otherwise use the default PoolClient.
 * @returns Row arrays from query result.
 */
export const query = <T extends Record<string, any>>(
  text: string,
  args: any[] = [],
  client?: PoolClient,
) => multiQuery<T>([text], args, false, client).then((res) => res[0]);

/**
 * Count the number of rows in a table.
 * @param table - Name of table
 * @param sqlFilter - SQL inserted after 'FROM table', may use '$' placeholders.
 * @param args - Arguments to replace '$' placeholders in sqlFilter.
 * @param client - If provided, use this PoolClient,
 *    otherwise use the default PoolClient.
 * @returns Number of rows matching the filter (Or all rows if no filter provided).
 */
export async function getCount(
  table: TableName,
  sqlFilter = "",
  args: any[] = [],
  client?: PoolClient,
) {
  // strTest(table);
  // strTest(sqlFilter);
  const res = await query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${table} ${sqlFilter};`,
    args ?? [],
    client,
  );
  return Number(res?.[0]?.count ?? 0);
}

/**
 * Get rows from a table.
 * @param table - Name of table
 * @param sqlFilter - SQL inserted after 'FROM table', may use '$' placeholders.
 * @param args - Arguments to replace '$' placeholders in sqlFilter.
 * @param cols - Column names to return (Array or comma-seperated string).
 * @param limit - Maximum number of rows to return.
 * @param offset - Start return from this row index.
 * @param client - If provided, use this PoolClient,
 *    otherwise use the default PoolClient.
 * @returns Array of rows matching options.
 */
export function getRows<T extends Record<string, any>>(
  table: TableName,
  sqlFilter = "",
  args: any[] = [],
  cols: (keyof T)[] | "*" | string = "*",
  limit?: number,
  offset?: number,
  client?: PoolClient,
): Promise<T[]> {
  // strTest(table);
  // strTest(sqlFilter);
  // strTest(cols);
  return query<T>(
    `SELECT ${
      Array.isArray(cols) ? cols.join(", ") : cols
    } FROM ${table} ${sqlFilter || ""}${
      typeof limit === "number" ? ` LIMIT ${limit}` : ""
    }${typeof offset === "number" ? ` OFFSET ${offset}` : ""};`,
    args,
    client,
  );
}

/**
 * Get a single entry from a table.
 * @param table - Name of table
 * @param rowId - ID of the row to return.
 * @param cols - Column names to return (Array or comma-seperated string).
 * @param options - Additional options.
 * @returns Row with the given rowID or undefined if not found.
 */
export function getRow<T extends Record<string, any>>(
  table: TableName,
  rowId: any,
  cols?: (keyof T)[] | "*" | string,
  options?: Omit<GetOptions<T>, "getOne"> & { getOne?: true },
): Promise<T | undefined>;
export function getRow<T extends Record<string, any>>(
  table: TableName,
  rowId: any,
  cols: (keyof T)[] | "*" | string,
  options: Omit<GetOptions<T>, "getOne"> & { getOne: false },
): Promise<T[]>;
export function getRow<T extends Record<string, any>>(
  table: TableName,
  rowId: any,
  cols: (keyof T)[] | "*" | string = "*",
  { idCol = "id", getOne, looseMatch = false, client }: GetOptions<T> = {},
): Promise<T | T[] | undefined> {
  // strTest(table);
  // strTest(cols);
  if (getOne == null) getOne = rowId != null;
  return getRows<T>(
    table,
    rowId == null ? rowId : `WHERE ${idCol} ${looseMatch ? "ILIKE" : "="} $1`,
    rowId == null ? [] : [rowId],
    cols,
    getOne ? 1 : undefined,
    undefined,
    client,
  ).then((res) => (getOne ? res[0] : res));
}

/**
 * Add rows to a table.
 * @param table - Name of table
 * @param objArray - Array of rows to add.
 *    NOTE: First entry must contain all possible keys.
 * @param options - Additional options.
 * @returns New(/updated) entries from database (Columns from options.returning).
 */
export async function addRows<T extends Record<string, any>>(
  table: TableName,
  objArray: Partial<T>[],
  { upsert = false, returning = "*", client }: AddOptions<T> = {},
) {
  if (objArray.length === 0) {
    logger.warn(`Attempting to add 0 rows to ${table}`);
    return [];
  }

  const keys = Object.keys(objArray[0]);
  if (!keys.length) {
    logger.warn(`Adding ${objArray.length} empty row(s) to ${table}`);
  }
  // strTest(table);
  // strTest(keys);
  return query<T>(
    `${upsert ? "UP" : "IN"}SERT INTO ${table} ${
      keys.length ? "(" + keys.join(",") + ")" : "DEFAULT"
    } VALUES ${queryLabels(objArray, keys).join(
      ", ",
    )}${returning ? ` RETURNING ${returning}` : ""};`,
    queryValues(objArray, keys),
    client,
  );
}

/**
 * Add rows to a table.
 * @param table - Name of table
 * @param rowObj - New row entry to add.
 * @param options - Additional options.
 * @returns If added, returns entry from database (Columns from options.returning).
 */
export const addRow = <T extends Record<string, any>>(
  table: TableName,
  rowObj?: Partial<T>,
  options: AddOptions<T> = {},
): Promise<T | undefined> =>
  addRows<T>(table, rowObj ? [rowObj] : [], options).then((res) => res[0]);

/**
 * Delete rows from a table.
 * @param table - Name of table
 * @param sqlFilter - SQL inserted after 'FROM table', may use '$' placeholders.
 * @param args - Arguments to replace '$' placeholders in sqlFilter.
 * @param client - If provided, use this PoolClient,
 *    otherwise use the default PoolClient.
 * @param returning - Comma-separated list of columns to return.
 *    - 'null' returns none
 *    - (Default) '*' returns all.
 * @returns Array of rows that were deleted.
 */
export function rmvRows<T extends Record<string, any>>(
  table: TableName,
  sqlFilter = "",
  args: any[] = [],
  client?: PoolClient,
  returning: string | null = "*",
) {
  // strTest(table);
  return query<T>(
    `DELETE FROM ${table} ${sqlFilter}${returning ? ` RETURNING ${returning}` : ""};`,
    args,
    client,
  );
}

/**
 * Delete a single row from a table.
 * @param table - Name of table
 * @param rowId - ID of the row to delete.
 * @param client - If provided, use this PoolClient,
 *    otherwise use the default PoolClient.
 * @param idCol - Comma-separated list of columns to return.
 *    - 'null' returns none
 *    - (Default) '*' returns all.
 * @returns Row that was deleted or undefined if not found.
 */
export const rmvRow = <T extends Record<string, any>>(
  table: TableName,
  rowId: any,
  client?: PoolClient,
  idCol: keyof T & string = "id",
): Promise<T | undefined> =>
  rmvRows<T>(table, `WHERE ${idCol} = $1`, [rowId], client).then(
    (res) => res[0],
  );

/**
 * Update a single row in a table.
 * @param table - Name of table
 * @param rowId - ID of the row to return.
 * @param updateObj - Values to update in the row.
 * @param options - Additional options.
 * @returns Updated rows from database (Columns from options.returning).
 */
export async function updateRow<T extends Record<string, any>>(
  table: TableName,
  rowId: any,
  updateObj: Partial<T>,
  {
    idCol = "id",
    looseMatch = false,
    returnArray = false,
    returning = "*",
    client,
  }: UpdateOptions<T> = {},
): Promise<(T & Partial<typeof MISSING_ENTRY>)[]> {
  const keys = Object.keys(updateObj);

  if (!keys.length) {
    throw new Error(`No properties provided to update ${table}[${rowId}]`);
  }
  // strTest(table);
  // strTest(keys);

  const queryText = `UPDATE ${table} SET ${keys
    .map((col, idx) => `${col} = $${idx + 1}`)
    .join(", ")}${
    rowId == null
      ? ""
      : ` WHERE ${idCol} ${looseMatch ? "ILIKE" : "="} $${keys.length + 1}`
  }${returning ? ` RETURNING ${returning}` : ""};`;

  const args =
    rowId == null
      ? Object.values(updateObj)
      : [...Object.values(updateObj), rowId];

  const result = await query<T>(queryText, args, client);

  return returnArray
    ? result.map((data) => ({
        [idCol]: rowId,
        ...(updateObj as T),
        ...(data || { ...MISSING_ENTRY }),
      }))
    : [
        {
          [idCol]: rowId,
          ...(updateObj as T),
          ...(result[0] || { ...MISSING_ENTRY }),
        },
      ];
}

/**
 * Update a many rows in a table.
 * @param table - Name of table
 * @param updateObjArray - Row data to update (Each entry must include rowID).
 * @param options - Additional options.
 * @returns Updated rows from database (Columns from options.returning).
 */
export async function updateRows<T extends Record<string, any>>(
  table: TableName,
  updateObjArray: Partial<T>[],
  {
    idCol = "id",
    types = {},
    returning = "*",
    client,
  }: MultiUpdateOptions<T> = {},
): Promise<T[]> {
  const allTypes = { id: "UUID", ...types };

  updateObjArray = updateObjArray.filter((item) => item[idCol]);
  if (!updateObjArray?.length)
    throw new Error(`No properties or keys provided to update ${table}`);

  const keys = Object.keys(updateObjArray[0]);
  const updateKeys = keys.filter((key) => key !== idCol);
  // strTest(keys);
  // strTest(Object.values(allTypes));

  if (Array.isArray(returning)) {
    returning = returning
      .map((col) => (col.includes(".") ? col : `${table}.${col}`))
      .join(", ");
  }

  const queryText = `UPDATE ${table} SET ${updateKeys
    .map((key) => `${key} = ${UPDATE_KEY}.${key}`)
    .join(", ")} FROM (VALUES ${updateObjArray
    .map(
      (_, i) =>
        `(${keys.map((key, j) => `$${i * keys.length + j + 1}${allTypes[key] ? `::${allTypes[key]}` : ""}`).join(", ")})`,
    )
    .join(", ")}) AS ${UPDATE_KEY}(${keys.join(
    ", ",
  )}) WHERE ${table}.${idCol} = ${UPDATE_KEY}.${idCol}${returning ? ` RETURNING ${returning}` : ""};`;

  const result = await query<T>(
    queryText,
    updateObjArray.flatMap((item) => keys.map((key) => item[key])),
    client,
  );

  return result.map((data) => ({
    ...(updateObjArray.find((item) => item[idCol] === data[idCol]) ?? {}),
    ...data,
  }));
}

export const operation = <T>(
  op: (client: PoolClient) => Promise<T>,
): Promise<T | undefined> => directOp(op);

export const file = (...files: string[]) => execFiles(files);

// --- OPTION TYPES --- \\

export type GetOptions<T extends Record<string, any>> = {
  /** Name of ID column (Default: 'id'). */
  idCol?: (keyof T & string) | string;
  /** Use 'LIMIT 1' to optimize response time (Default: true). */
  getOne?: boolean;
  /** Use 'ILIKE' instead of '=' for looser matching (Default: false) */
  looseMatch?: boolean;
  /** Use this PoolClient, otherwise use the default PoolClient. */
  client?: PoolClient;
};

export type AddOptions<T extends Record<string, any>> = {
  /** Update columns if they already exist (Default: false). */
  upsert?: boolean;
  /** Columns to return, 'null' returns none, '*' returns all (Default: '*'). */
  returning?: (keyof T & string)[] | "*" | string | null;
  /** Use this PoolClient, otherwise use the default PoolClient. */
  client?: PoolClient;
};

export type UpdateOptions<T extends Record<string, any>> = {
  /** Name of ID column (Default: 'id'). */
  idCol?: (keyof T & string) | string;
  /** Use 'ILIKE' instead of '=' for looser matching (Default: false) */
  looseMatch?: boolean;
  /** If true, only returns first result (Default: true). */
  returnArray?: boolean;
  /** Columns to return, 'null' returns none, '*' returns all (Default: '*'). */
  returning?: (keyof T & string)[] | "*" | string | null;
  /** Use this PoolClient, otherwise use the default PoolClient. */
  client?: PoolClient;
};

export type MultiUpdateOptions<T extends Record<string, any>> = Pick<
  UpdateOptions<T>,
  "idCol" | "returning" | "client"
> & {
  /** Object of column types `{ [col]: 'SQL TYPE' }`. */
  types?: { [key in keyof T & string]?: string };
};
