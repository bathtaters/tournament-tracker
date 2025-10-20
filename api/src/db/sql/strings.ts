// SQL Constants
import type { TableName } from "types/base";
import type { LogEntry } from "types/models";

export const clock = {
  start:
    "UPDATE event SET clockstart = now() - COALESCE(clockmod, '0 seconds'), clockmod = NULL WHERE id = $1 AND clockstart IS NULL RETURNING *;",
  pause:
    "UPDATE event SET clockstart = NULL, clockmod = now() - (SELECT clockstart FROM event WHERE id = $1) WHERE id = $1 AND clockmod IS NULL AND clockstart IS NOT NULL RETURNING *;",
};

export const event = {
  byEventId: "WHERE eventid = $1",
  maxSlot: [
    "SELECT slot FROM event@date_idx WHERE ",
    " ORDER BY slot DESC LIMIT 1;",
  ],
  removePlayer:
    "UPDATE event SET players = array_remove(players, $1::UUID) WHERE $1::UUID = ANY(players) " +
    "RETURNING *",
  maxRound:
    "SELECT round FROM match WHERE eventid = $1 ORDER BY round DESC LIMIT 1;",
  deleteRound: "WHERE eventid = $1 AND round = $2",
  complete:
    "LEFT JOIN event ON event.id = eventid WHERE event.roundactive > event.roundcount",
  unplan: "UPDATE event SET plan = 0 WHERE NOT(id = ANY($1)) RETURNING *;",
  schedule: {
    prefix:
      "SELECT COALESCE(TO_CHAR(day), 'none') as day, JSON_OBJECT_AGG(id::STRING, slot) as eventslots FROM event@date_idx ",
    useSettings:
      "WHERE plan < 1 OR (SELECT value FROM settings WHERE id = 'planschedule') = 'true' ",
    planOnly: "WHERE plan > 0 ",
    suffix: "GROUP BY day;",
  },
};

export const player = {
  eventFilter:
    "SELECT e.id FROM event e WHERE $1::UUID = ANY(e.players) OR e.id IN ( " +
    "SELECT e2.id FROM event e2 JOIN team t ON t.id = ANY(e2.players) " +
    "WHERE $1::UUID = ANY(t.players) ) ORDER BY e.day;",
  matchFilter:
    "m LEFT JOIN team t ON t.id = ANY(m.players) AND $1::UUID = ANY(t.players)" +
    "WHERE $1::UUID = ANY(m.players) OR t.id IS NOT NULL",
  hasAdminFilter: "WHERE access > 2 LIMIT 2",
  isLastAdmin: `
    SELECT (SELECT COUNT(*) FROM player WHERE access > 2 AND id  = $1 LIMIT 1) > 0
       AND (SELECT COUNT(*) FROM player WHERE access > 2 AND id != $1 LIMIT 1) < 1
    AS result;`,
};

export const team = {
  eventFilter:
    "t WHERE t.id = ANY(SELECT unnest(e.players) FROM event e WHERE e.id = $1)",
  cleanupFilter:
    "WHERE id NOT IN (" +
    " SELECT DISTINCT unnest(players) FROM event" +
    " WHERE players IS NOT NULL AND array_length(players, 1) > 0 )",
  allRelations: `
    SELECT
      player_id AS id,
      ARRAY_AGG(team_id) AS players
    FROM (
           SELECT
             UNNEST(t.players) AS player_id,
             t.id AS team_id
           FROM team t
           WHERE t.id = ANY(
             SELECT UNNEST(e.players)
             FROM event e
             WHERE e.team = 'UNIFIED'
           )
         ) player_team_pairs
    GROUP BY player_id;`,
  /* Only do 'UNIFIED' here because 'DISTRIB' will copy
   *  scores from every game by every team member to the team
   *  instead of only the games that player was on that team.
   *  Also it's unnecessary since this is only for player rankings. */

  eventRelations: `
    WITH event_teams AS (
        SELECT 
            t.id AS team_id,
            t.players,
            e.team AS event_team_type
        FROM team t
        INNER JOIN (
            SELECT id, UNNEST(players) AS team_id, team 
            FROM event 
            WHERE event.id = $1 AND team IN ('DISTRIB', 'UNIFIED')
        ) e ON t.id = e.team_id
    )
    SELECT 
        team_id AS id,
        players
    FROM event_teams 
    WHERE event_team_type = 'DISTRIB'
    
    UNION ALL
    
    SELECT 
        player_id AS id,
        ARRAY_AGG(team_id) AS players
    FROM (
        SELECT 
            UNNEST(players) AS player_id,
            team_id
        FROM event_teams 
        WHERE event_team_type = 'UNIFIED'
    ) player_teams
    GROUP BY player_id;`,
};

export const match = {
  listAll:
    "SELECT eventid, round, array_agg(id ORDER BY array_length(players, 1) DESC, id) matches FROM match GROUP BY eventid, round;",
  list: "SELECT eventid, round, array_agg(id ORDER BY array_length(players, 1) DESC, id) matches FROM match WHERE eventid = $1 GROUP BY eventid, round;",
  drop: "UPDATE match SET drops = ARRAY_APPEND(drops, $2) WHERE id = $1 RETURNING *;",
  undrop:
    "UPDATE match SET drops = ARRAY_REMOVE(drops, $2) WHERE id = $1 RETURNING *;",
  complete: event.complete,
  allCounts: `
    WITH unnested AS (SELECT id, unnest(players) AS player FROM match WHERE eventid <> $1)
    SELECT
        player1 AS id,
        player2 AS opp,
        COUNT(*) AS count
    FROM (
        SELECT a.player AS player1, b.player AS player2
        FROM unnested a
        JOIN unnested b ON a.id = b.id
        WHERE a.player <> b.player
    ) as p
    GROUP BY player1, player2;`,
};

export const voter = {
  upsert: (ids) =>
    `INSERT INTO voter (id, idx) VALUES ${ids
      .map((_, idx) => `($${idx * 2 + 1}::UUID, $${idx * 2 + 2})`)
      .join(
        ", ",
      )} ON CONFLICT (id) DO UPDATE SET idx = EXCLUDED.idx RETURNING *;`,
  rmv: "DELETE FROM voter WHERE NOT(id = ANY($1)) RETURNING *;",
};

export const plan = {
  reset: [
    "DELETE FROM voter WHERE TRUE;",
    "UPDATE event SET plan = 0 WHERE TRUE;",
    "DELETE FROM settings WHERE id = 'plandates' OR id = 'planslots';",
  ],
};

export const log = {
  userSessions:
    "SELECT userid, ARRAY_AGG(DISTINCT sessionid) AS sessionids FROM log WHERE NOT (action = 'login' AND error IS NOT NULL) GROUP BY userid",
  nonNullFilter: "AND sessionid IS NOT NULL AND userid IS NOT NULL",
  sessionFilter: "AND sessionid = $1 AND userid IS NOT NULL",
  userFilter: "AND userid = $1 AND sessionid IS NOT NULL",
  logFilter,
  matchesFilter: (sqlFilter: string) =>
    sqlFilter.replace(
      /tableid = [^$]+(\$\d+)[^\s]+/,
      (_, p) =>
        `(tableid = ${p} OR tableid IN (SELECT id::STRING FROM match WHERE eventid = ${p}::UUID))`,
    ),
};

/** Build log SQL filter and Args array from parameters */
function logFilter(
  tables: TableName[] | null,
  timeRange: TimeRange,
  inclFailed = false,
  tableids: LogEntry["tableid"][] = [],
  userids: LogEntry["userid"][] = [],
  timeSort = true,
): [string, any[]] {
  let sqlFilters: string[] = [],
    args = [];

  if (tables?.length) {
    args.push(tables);
    sqlFilters.push(`dbtable = ANY($${args.length})`);
  }
  if (tableids?.length) {
    args.push(tableids);
    sqlFilters.push(`tableid = ANY($${args.length})`);
  }
  if (userids?.length) {
    args.push(userids);
    sqlFilters.push(`userid = ANY($${args.length}::UUID[])`);
  }

  if (timeRange?.after) {
    args.push(timeRange.after.toISOString());
    sqlFilters.push(`ts >= $${args.length}::TIMESTAMPTZ`);
  }
  if (timeRange?.before) {
    args.push(timeRange.before.toISOString());
    sqlFilters.push(`ts <= $${args.length}::TIMESTAMPTZ`);
  }

  if (!inclFailed) sqlFilters.push("error IS NULL");

  const sortStr = timeSort ? " ORDER BY ts DESC" : "";

  return [`WHERE ${sqlFilters.join(" AND ")}${sortStr}`, args];
}

export type TimeRange = { after?: Date; before?: Date };
