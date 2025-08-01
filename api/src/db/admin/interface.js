/* *** SIMPLE SQL UI *** */
const logger = require("../../utils/log.adapter");
const direct = require("./directOps");
const {
  strTest,
  queryLabels,
  queryValues,
  getReturn,
  getFirst,
  getSolo,
} = require("../../utils/dbInterface.utils");

// Custom query
const query = (text, args, splitArgs, client) =>
  (client || direct)
    .query(text, args, splitArgs)
    .then(getSolo(text))
    .then(getReturn);

// SELECT
const getCount = (table, sqlFilter, args, client) =>
  // strTest(table) || strTest(sqlFilter) ||
  (client || direct)
    .query(
      `SELECT COUNT(*) AS count FROM ${table} ${sqlFilter || ""};`,
      args || []
    )
    .then(getFirst())
    .then(getReturn)
    .then((r) => Number(r?.[0]?.count));

const getRows = (table, sqlFilter, args, cols, limit, offset, client) =>
  // strTest(table) || strTest(sqlFilter) || strTest(cols) ||
  (client || direct)
    .query(
      `SELECT ${
        (Array.isArray(cols) ? cols.join(", ") : cols) || "*"
      } FROM ${table} ${sqlFilter || ""}${
        limit ? ` LIMIT ${limit} OFFSET ${offset || 0}` : ""
      };`,
      args || []
    )
    .then(getSolo())
    .then(getReturn);

const getRow = (
  table,
  rowId,
  cols,
  { idCol = "id", getOne = true, client, looseMatch } = {}
) =>
  // strTest(table) || strTest(cols);
  module.exports
    .getRows(
      // exports required for unit testing
      table,
      rowId ? `WHERE ${idCol} ${looseMatch ? "ILIKE" : "="} $1` : "",
      rowId && [rowId],
      cols,
      rowId && getOne ? 1 : 0,
      0,
      client
    )
    .then(getFirst(getOne && !!rowId));

// INSERT/UPSERT
const addRows = async (
  table,
  objArray,
  { client, upsert, returning = "*" } = {}
) => {
  // strTest(table);
  if (!objArray) throw new Error("Missing rows to add to " + table + " table.");
  const keys = objArray[0] ? Object.keys(objArray[0]) : [];
  if (!keys.length) logger.warn("Added empty row to " + table);
  strTest(keys);

  return (client || direct)
    .query(
      `${upsert ? "UP" : "IN"}SERT INTO ${table} ${
        keys.length ? "(" + keys.join(",") + ")" : "DEFAULT"
      } VALUES ${queryLabels(objArray, keys).join(
        ", "
      )}${returning ? ` RETURNING ${returning}` : ""};`,
      queryValues(objArray, keys)
    )
    .then(getSolo())
    .then(getReturn);
};

const addRow = (table, rowObj, options = {}) =>
  module.exports
    .addRows(table, rowObj ? [rowObj] : [], options)
    .then(getFirst());

// DELETE
const rmvRows = (table, args, sqlFilter, client = null, returning = "*") =>
  // strTest(table) ||
  (client || direct)
    .query(
      `DELETE FROM ${table} ${sqlFilter || ""}${returning ? ` RETURNING ${returning}` : ""};`,
      args || []
    )
    .then(getSolo())
    .then(getReturn);

const rmvRow = (table, rowId, client = null) =>
  module.exports
    .rmvRows(table, [rowId], "WHERE id = $1", client)
    .then(getFirst());

// UPDATE
const updateRow = async (
  table,
  rowId,
  updateObj,
  { client, idCol, looseMatch, returnArray, returning = "*" } = {}
) => {
  // strTest(table);
  const keys = Object.keys(updateObj || {});

  if (!keys.length)
    throw new Error(
      "No properties provided to update " + table + "[" + rowId + "]"
    );
  strTest(keys);

  return (client || direct)
    .query(
      `UPDATE ${table} SET ${keys
        .map((col, idx) => `${col} = $${idx + 1}`)
        .join(", ")}${
        rowId == null
          ? ""
          : ` WHERE ${idCol || "id"} ${looseMatch ? "ILIKE" : "="} $${keys.length + 1}`
      }${returning ? ` RETURNING ${returning}` : ""};`,

      rowId == null
        ? Object.values(updateObj || {})
        : [...Object.values(updateObj || {}), rowId]
    )
    .then(getSolo())
    .then(getReturn)
    .then((ret) =>
      ret?.length
        ? ret.map((data) => ({
            [idCol || "id"]: rowId,
            ...(updateObj || {}),
            ...(data || { error: "Missing return value." }),
          }))
        : [{ error: "Missing return value." }]
    )
    .then(getFirst(!returnArray));
};

const updateRows = async (
  table,
  updateObjArray,
  { client = direct, idCol = "id", types = {}, returning = "*" } = {}
) => {
  if (!("id" in types)) types.id = "UUID";
  updateObjArray =
    updateObjArray && updateObjArray.filter((item) => item[idCol]);
  if (!updateObjArray?.length)
    throw new Error(`No properties or keys provided to update ${table}`);

  const keys = Object.keys(updateObjArray[0]);
  const updateKeys = keys.filter((key) => key !== idCol);
  strTest(keys);
  strTest(Object.values(types));

  if (returning)
    returning = returning
      .split(/\s*,\s*/)
      .map((col) => (col.includes(".") ? col : `${table}.${col}`))
      .join(", ");
  const upd = table === "upd" ? "u" : "upd";

  return client
    .query(
      `UPDATE ${table} SET ${updateKeys
        .map((key) => `${key} = ${upd}.${key}`)
        .join(", ")} FROM (VALUES ${updateObjArray
        .map(
          (_, i) =>
            `(${keys.map((key, j) => `$${i * keys.length + j + 1}${types[key] ? `::${types[key]}` : ""}`).join(", ")})`
        )
        .join(", ")}) AS ${upd}(${keys.join(
        ", "
      )}) WHERE ${table}.${idCol} = ${upd}.${idCol}${returning ? ` RETURNING ${returning}` : ""};`,

      updateObjArray.flatMap((item) => keys.map((key) => item[key]))
    )
    .then(getSolo())
    .then(getReturn)
    .then(
      (r) =>
        r &&
        r.map((data) => ({
          ...updateObjArray.find((item) => item[idCol] === data[idCol]),
          ...data,
        }))
    );
};

module.exports = {
  query,
  getCount,
  getRow,
  getRows,
  addRows,
  addRow,
  updateRow,
  updateRows,
  rmvRow,
  rmvRows,
  operation: (op) => direct.operation(op).then(getReturn),
  file: (...files) => direct.execFiles(files).then(getReturn),
};
