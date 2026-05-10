/* *** ADVANCED SQL UI *** */
import type { PoolClient, QueryResult } from "pg";
import fs from "fs/promises";
import { closeConnection, openConnection, runOperation } from "./connect";
import dbConfig from "../../config/dbServer.json";

/**
 * Run a set of custom SQL query on the database.
 * @param queries - SQL statement or array of statements, using '$' placeholders.
 * @param args - Arguments to replace '$' placeholders in query text
 * @param splitArgs - True to split 'args' by SQL statement.
 *  - If true, text[0] uses args[0], text[1] uses args[1], etc.
 *  - If false, the full 'args' array is used with each statement.
 * @param client - If provided, use this PoolClient,
 *    otherwise use the default PoolClient.
 * @returns Array of row arrays from query results.
 */
export async function query<T extends Record<string, any>>(
  queries: string[],
  args: any[] | any[][] = [], // If splitArgs is true: [[qry1 args], [qry2 args], etc]
  splitArgs = true, // Otherwise, full 'args' are sent to each query
  client?: PoolClient,
): Promise<T[][]> {
  // logger.debug('QUERIES:', queries, args);
  let res: QueryResult<T>[];

  if (client) {
    // Custom client pool
    res = await Promise.all(
      queries.map((q, i) => client.query<T>(q, splitArgs ? args[i] : args)),
    );
  } else {
    // Default client pool
    res = await runOperation((client: PoolClient) =>
      Promise.all(
        queries.map((q, i) => client.query(q, splitArgs ? args[i] : args)),
      ),
    );
  }
  return res.map((r) => r.rows ?? []);
}

/**
 * Load commands from a .SQL file
 * @param pathArray - List of paths to load SQL statments from.
 * @returns Array of SQL commands as text
 */
export async function loadFiles(pathArray: string[]) {
  // Read files into array
  const fileData = await Promise.all(
    pathArray.map((path) =>
      fs
        .readFile(path)
        .then((file) =>
          file.toString().replace(/%DB%/g, dbConfig.server.db).split(";"),
        )
        .catch((e) => {
          throw new Error(
            `Unable to read SQL file '${path}': ${
              e.message || e.description || e
            }`,
          );
        }),
    ),
  );

  // Remove comments and minimize white space
  return fileData
    .flatMap((file) =>
      file?.map(
        (line) =>
          line &&
          line
            .replace(/--[^\n]*(?:\n|$)/g, "")
            .replace(/\s+/g, " ")
            .trim(),
      ),
    )
    .filter(Boolean);
}

/**
 * Execute commands from a .SQL file
 * @param pathArray - List of SQL files to execute.
 */
export const execFiles = async (pathArray: string[]) => {
  const text = await loadFiles(pathArray);
  await query(text);
};

export {
  runOperation as operation,
  openConnection as init,
  closeConnection as deinit,
};
