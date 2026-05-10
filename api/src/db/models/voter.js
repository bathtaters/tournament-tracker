/* *** VOTER Object *** */
const db = require("../admin/interface");
const log = require("./log");
const sql = require("../sql/strings").voter;
const { TableName, LogAction } = require("../../config/validation").enums;

// Get single or all vote data
const get = (id) => db.getRow("voter", id);

// Add players as voter, updating indexes
const upsert = (ids, req) =>
  !ids.length
    ? Promise.resolve([])
    : log.query(
        sql.upsert(ids),
        ids.flatMap((id, idx) => [id, idx + 1]),
        (data, error) =>
          error
            ? ids.map((tableid, idx) => ({
                dbtable: TableName.VOTER,
                action: LogAction.UPSERT,
                data: { idx },
                tableid,
                error,
              }))
            : {
                dbtable: TableName.VOTER,
                action: LogAction.UPSERT,
                tableid: data.id,
                data,
              },
        req,
      );

// Remove player as voter
const rmvOther = (ids, req) =>
  log.query(
    sql.rmv,
    [ids],
    (data, error) =>
      error
        ? {
            dbtable: TableName.VOTER,
            action: LogAction.DELETE,
            tableid: `NOT IN (${ids.join(",")})`,
            error,
          }
        : {
            dbtable: TableName.VOTER,
            action: LogAction.DELETE,
            tableid: data.id,
            data,
          },
    req,
  );

// Set player's votes
const set = (id, newData, req) => log.updateRows("voter", id, newData, req);

module.exports = { get, upsert, rmvOther, set };
