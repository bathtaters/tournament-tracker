/* *** LOG Operations *** */
const { sqlSub } = require('../../utils/dbInterface.utils');
const db = require('../admin/interface');
const { logFilter, matchesFilter } = require('../sql/strings').log

// Maximum number of LOG entries to return at a time if not specified
const DEFAULT_LIMIT = 100

/**
 * Get all log entries, optionally filtering by range/table/success
 * @param {{ after?: Date, before?: Date }} [timeRange] - Time period to return entries within
 * @param {TableName[]} [tables] - Only return entries for these tables
 * @param {boolean} [inclFailed] - If true include changes that did not succeed
 * @param {string} [tableid] - Only return entries with the provided tableId
 * @param {number} [limit] - Maximum number of entrie to return (0 to return all, Default: 100)
 * @param {number} [offset] - Offset of first entry returned (Default: 0)
 * @returns {Promise<LogEntry[]>} - A list of matching log entries (Sorted from latest to oldest)
 */
const get = (timeRange, tables, inclFailed, limit = DEFAULT_LIMIT, offset = 0) => db.getRows(
    'log',
    ...logFilter(tables, timeRange, inclFailed),
    null, limit, offset
);


/**
 * Get all entries pertaining to a specific event (Event + Match)
 * @param {string} eventid - ID of Event to lookup entries for
 * @param {{ after?: Date, before?: Date }} [timeRange] - Time period to return entries within
 * @param {boolean} [inclFailed] - If true include changes that did not succeed
 * @param {number} [limit] - Maximum number of entrie to return (0 to return all, Default: 100)
 * @param {number} [offset] - Offset of first entry returned (Default: 0)
 * @returns {Promise<LogEntry[]>} - A list of matching log entries (Sorted from latest to oldest)
 */
const getEvent = (eventid, timeRange, inclFailed = false, limit = DEFAULT_LIMIT, offset = 0) => {
    let [sqlFilter, sqlArgs] = logFilter([TableName.EVENT, TableName.MATCH], timeRange, inclFailed, eventid)
    return db.getRows('log', matchesFilter(sqlFilter), sqlArgs, null, limit, offset)
}


/**
 * Get all entries pertaining to a specific player (Player + Voter)
 * @param {string} playerid - ID of Player to lookup entries for
 * @param {{ after?: Date, before?: Date }} [timeRange] - Time period to return entries within
 * @param {boolean} [inclFailed] - If true include changes that did not succeed
 * @param {number} [limit] - Maximum number of entrie to return (0 to return all, Default: 100)
 * @param {number} [offset] - Offset of first entry returned (Default: 0)
 * @returns {Promise<LogEntry[]>} - A list of matching log entries (Sorted from latest to oldest)
 */
const getPlayer = (playerid, timeRange, inclFailed = false, limit = DEFAULT_LIMIT, offset = 0) => db.getRows(
    'log',
    ...logFilter([TableName.PLAYER, TableName.VOTER], timeRange, inclFailed, [playerid]),
    null, limit, offset
);


/**
 * Get all entries created by a specific user
 * @param {string} userid - ID of User to lookup entries created by
 * @param {{ after?: Date, before?: Date }} [timeRange] - Time period to return entries within
 * @param {TableName[]} [tables] - Only return entries for these tables
 * @param {boolean} [inclFailed] - If true include changes that did not succeed
 * @param {number} [limit] - Maximum number of entrie to return (0 to return all, Default: 100)
 * @param {number} [offset] - Offset of first entry returned (Default: 0)
 * @returns {Promise<LogEntry[]>} - A list of matching log entries (Sorted from latest to oldest)
 */
const getUser = (userid, timeRange, tables, inclFailed = false, limit = DEFAULT_LIMIT, offset = 0) => db.getRows(
    'log',
    ...logFilter(tables, timeRange, inclFailed, null, [userid]),
    null, limit, offset
);

/**
 * Add one or more entries to the log
 * @param {LogEntry | LogEntry[]} entries - One entry or a list of entries to add
 * @returns {Promise<LogEntry[]>} - List of new log entries
 */
const addEntries = (entries) => db.addRows('log', Array.isArray(entries) ? entries : entries ? [entries] : [])

/**
 * Delete one or more entries from the log
 * @param {string | string[]} ids - One ID or a list of IDs to delete
 * @returns {Promise<LogEntry[]>} - List of deleted log entries
 */
const rmvEntries = (ids) => Promise.all((Array.isArray(ids) ? ids : ids ? [ids] : []).map((id) => db.rmvRow('log', id)))


// -- ENTRY OBJECTS -- \\

/** Same as db.addRows, also creates a log entry
 * (objArray may also be a single object to use addRow). */
const addRows = async (dbtable, objArray, userid, { tableid, ...options } = {}) => {
    try {
        let res, entries
        if (Array.isArray(objArray)) {
            entries = res = await db.addRows(dbtable, objArray, options)
        } else {
            res = await db.addRow(dbtable, objArray, options)
            entries = res && [res]
        }
        
        if (entries?.length) await addEntries(entries.map((data) => ({
            dbtable, userid,
            data: dbtable === TableName.SETTINGS && data.value ? { value: data.value } : data,
            tableid: data.id ?? tableid,
            action: options.upsert ? LogAction.UPDATE : LogAction.CREATE,
        })))
        else await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable, userid,
            data: dbtable === TableName.SETTINGS && data.value ? { value: data.value } : data,
            tableid: data.id ?? tableid,
            action: options.upsert ? LogAction.UPDATE : LogAction.CREATE,
            error: "No return from insert operation.",
        })))
        return res

    } catch (error) {
        await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable, userid,
            data: dbtable === TableName.SETTINGS && data.value ? { value: data.value } : data,
            tableid: data.id ?? tableid,
            action: options.upsert ? LogAction.UPDATE : LogAction.CREATE,
            error: error?.message || error?.toString() || "Unknown error",
        })))
        throw error
    }
}

/** Same as db.updateRows, also creates a log entry
 * (objArray may also be a single obj w/ rowId to use updateRow). */
const updateRows = async (dbtable, rowId, objArray, userid, options = {}) => {
    try {
        let res
        if (Array.isArray(objArray)) res = await db.updateRows(dbtable, objArray, options)
        else res = await db.updateRow(dbtable, rowId, objArray, options)
        
        await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable, userid, data,
            tableid: data.id ?? res?.id ?? rowId,
            action: LogAction.UPDATE,
            error: res && res.length !== 0 ? null : "No return from update operation. Most likely no rows were found.",
        })))
        return res

    } catch (error) {
        await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable, userid, data,
            tableid: data.id ?? rowId,
            action: LogAction.UPDATE,
            error: error?.message || error?.toString() || "Unknown error",
        })))
        throw error
    }
}

/** Same as db.rmvRows, also creates a log entry
 *  (idOrArgs may also be a rowId and no sqlFilter provided to use rmvRow). */
const rmvRows = async (dbtable, idOrArgs, sqlFilter, userid, client) => {
    try {
        let res, entries
        if (!sqlFilter && idOrArgs && !Array.isArray(idOrArgs)) {
            res = await db.rmvRow(dbtable, idOrArgs, client)
            entries = res && [res]
        } else {
            entries = res = await db.rmvRows(dbtable, idOrArgs, sqlFilter, client)
        }
        
        if (entries?.length) await addEntries(entries.map((data) => ({
            dbtable, userid, data,
            tableid: data.id,
            action: LogAction.DELETE,
        })))
        else await addEntries({
            dbtable, userid,
            tableid: sqlFilter ? sqlSub(sqlFilter, idOrArgs) : idOrArgs,
            action: LogAction.DELETE,
            error: "No return from delete operation. Most likely no rows were found.",
        })
        return res

    } catch (error) {
        await addEntries({
            dbtable, userid,
            tableid: sqlFilter ? sqlSub(sqlFilter, idOrArgs) : idOrArgs,
            action: LogAction.DELETE,
            error: error?.message || error?.toString() || "Unknown error",
        })
        throw error
    }
}

/**
 * Same as db.query, also creates a log entry
 * @param {string} text - SQL text (w/ $ placeholders).
 * @param {any[]} args - Arguments to substitute for placeholders in text.
 * @param {(data: any, error?: string) => LogEntry} logMap - Convert result data or an error to a LogEntry
 * @param {boolean} splitArgs - If true, split 'text' & 'args' into multiple statements.
 * @param {Object} client - DB Client Connection to use instead of default.
 * @returns - Result of query
 */
const query = (text, args, logMap, splitArgs, client) => db.query(text, args, splitArgs, client).then(async (res) => {
    if (res?.length) await addEntries(res.flatMap((data) => logMap(data)))
    else await addEntries(logMap(null, "No result from DB operation. Most likely because no matches were found."))
    return res
}).catch(async (error) => {
    await addEntries(logMap(null, error?.message || error?.toString() || "Unknown error"))
    throw error
});


/**
 * Simple logging for password attempts
 * @param {string} userid - ID of user attempting to login (Or name if user not found)
 * @param {string} error - Error message of login attempt (Or null if login was successful)
 * @returns 
 */
const login = (userid, error, name) => addEntries({
    dbtable: TableName.PLAYER,
    action: LogAction.LOGIN,
    data: error ? null : { success: true },
    tableid: name || userid,
    userid, error,
}).then(() => error)


// -- TYPES -- //

/** @enum {string} */
const LogAction = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
}

/** @enum {string} */
const TableName = {
    EVENT: 'event',
    MATCH: 'match',
    PLAYER: 'player',
    VOTER: 'voter',
    SETTINGS: 'settings',
    LOG: 'log',
}

/**
 * @typedef {Object} LogEntry
 * @property {string} id - The unique identifier for the log entry.
 * @property {TableName} dbtable - The name of the table that was changed.
 * @property {string} tableid - The identifier of the row that was changed.
 * @property {LogAction} action - The type of change (e.g., 'update').
 * @property {Object} [data] - The data that was created/updated.
 * @property {string} userid - The ID of the user who made the change.
 * @property {string} [error] - Error message if the update failed, otherwise null.
 * @property {Date} ts - The timestamp of the update.
 */


module.exports = {  
    get, getEvent, getPlayer, getUser,
    addRows, updateRows, rmvRows, query, 
    login,
    addEntries, rmvEntries, 
    LogAction, TableName,
}
