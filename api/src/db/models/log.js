/* *** LOG Operations *** */
const { sqlSub } = require('../../utils/dbInterface.utils');
const { arrToObj } = require('../../utils/shared.utils');
const db = require('../admin/interface');
const qry = require('../sql/strings').log

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
    ...qry.logFilter(tables, timeRange, inclFailed),
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
    let [sqlFilter, sqlArgs] = qry.logFilter([TableName.EVENT, TableName.MATCH], timeRange, inclFailed, eventid)
    return db.getRows('log', qry.matchesFilter(sqlFilter), sqlArgs, null, limit, offset)
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
    ...qry.logFilter([TableName.PLAYER, TableName.VOTER], timeRange, inclFailed, [playerid]),
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
    ...qry.logFilter(tables, timeRange, inclFailed, null, [userid]),
    null, limit, offset
);

/**
 * Get all unique users for a given session ID.
 * @param {{userid?: string, sessionid?: string}} [filter] - Only lookup related session or user (If both provided, looks up user)
 * @returns {Promise<{userid: string[]} | string[]>} - If userid provided, 
 */
const getUserSessions = async ({ userid, sessionid } = {}) => {
    if (userid) {
        const res = await db.query(`${qry.userSessions} ${qry.userFilter};`, [userid])
        return res && res.flatMap(({ sessionids }) => sessionids)
    }
    else if (sessionid) {
        const res = await db.query(`${qry.userSessions} ${qry.sessionFilter};`, [sessionid])
        return res && res.map(({ userid }) => userid)
    }
    const res = await db.query(`${qry.userSessions} ${qry.nonNullFilter};`)
    return arrToObj('userid', {valKey: 'sessionids'})(res)
}

/**
 * Add one or more entries to the log
 * @param {LogEntry | LogEntry[]} entries - One entry or a list of entries to add
 * @param {Request} [req] - Request object to extract user and session IDs
 * @returns {Promise<LogEntry[]>} - List of new log entries
 */
const addEntries = (entries, req) => {
    if (!Array.isArray(entries)) entries = entries ? [entries] : []
    if (req) entries = entries.map((entry) => ({
        ...entry,
        userid: entry.userid || req.session.user || null,
        sessionid: entry.sessionid || req.sessionID || null,
    }))
    db.addRows('log', entries)
}

/**
 * Delete one or more entries from the log
 * @param {string | string[]} ids - One ID or a list of IDs to delete
 * @returns {Promise<LogEntry[]>} - List of deleted log entries
 */
const rmvEntries = (ids) => Promise.all((Array.isArray(ids) ? ids : ids ? [ids] : []).map((id) => db.rmvRow('log', id)))


// -- ENTRY OBJECTS -- \\

/** Same as db.addRows, also creates a log entry
 * (objArray may also be a single object to use addRow). */
const addRows = async (dbtable, objArray, req, { tableid, ...options } = {}) => {
    try {
        let res, entries
        if (Array.isArray(objArray)) {
            entries = res = await db.addRows(dbtable, objArray, options)
        } else {
            res = await db.addRow(dbtable, objArray, options)
            entries = res && [res]
        }
        
        if (entries?.length) await addEntries(entries.map((data) => ({
            dbtable,
            data: dbtable === TableName.SETTINGS && data.value ? { value: data.value } : data,
            tableid: data.id ?? tableid,
            action: options.upsert ? LogAction.UPDATE : LogAction.CREATE,
        })), req)
        else await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable,
            data: dbtable === TableName.SETTINGS && data.value ? { value: data.value } : data,
            tableid: data.id ?? tableid,
            action: options.upsert ? LogAction.UPDATE : LogAction.CREATE,
            error: "No return from insert operation.",
        })), req)
        return res

    } catch (error) {
        await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable,
            data: dbtable === TableName.SETTINGS && data.value ? { value: data.value } : data,
            tableid: data.id ?? tableid,
            action: options.upsert ? LogAction.UPDATE : LogAction.CREATE,
            error: error?.message || error?.toString() || "Unknown error",
        })), req)
        throw error
    }
}

/** Same as db.updateRows, also creates a log entry
 * (objArray may also be a single obj w/ rowId to use updateRow). */
const updateRows = async (dbtable, rowId, objArray, req, options = {}) => {
    try {
        let res
        if (Array.isArray(objArray)) res = await db.updateRows(dbtable, objArray, options)
        else res = await db.updateRow(dbtable, rowId, objArray, options)
        
        await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable, data,
            tableid: data.id ?? res?.id ?? rowId,
            action: LogAction.UPDATE,
            error: res && res.length !== 0 ? null : "No return from update operation. Most likely no rows were found.",
        })), req)
        return res

    } catch (error) {
        await addEntries((Array.isArray(objArray) ? objArray : [objArray]).map((data) => ({
            dbtable, data,
            tableid: data.id ?? rowId,
            action: LogAction.UPDATE,
            error: error?.message || error?.toString() || "Unknown error",
        })), req)
        throw error
    }
}

/** Same as db.rmvRows, also creates a log entry
 *  (idOrArgs may also be a rowId and no sqlFilter provided to use rmvRow). */
const rmvRows = async (dbtable, idOrArgs, sqlFilter, req, client) => {
    try {
        let res, entries
        if (!sqlFilter && idOrArgs && !Array.isArray(idOrArgs)) {
            res = await db.rmvRow(dbtable, idOrArgs, client)
            entries = res && [res]
        } else {
            entries = res = await db.rmvRows(dbtable, idOrArgs, sqlFilter, client)
        }
        
        if (entries?.length) await addEntries(entries.map((data) => ({
            dbtable, data,
            tableid: data.id,
            action: LogAction.DELETE,
        })), req)
        else await addEntries({
            dbtable,
            tableid: sqlFilter ? sqlSub(sqlFilter, idOrArgs) : idOrArgs,
            action: LogAction.DELETE,
            error: "No return from delete operation. Most likely no rows were found.",
        }, req)
        return res

    } catch (error) {
        await addEntries({
            dbtable,
            tableid: sqlFilter ? sqlSub(sqlFilter, idOrArgs) : idOrArgs,
            action: LogAction.DELETE,
            error: error?.message || error?.toString() || "Unknown error",
        }, req)
        throw error
    }
}

/**
 * Same as db.query, also creates a log entry
 * @param {string} text - SQL text (w/ $ placeholders).
 * @param {any[]} args - Arguments to substitute for placeholders in text.
 * @param {(data: any, error?: string) => LogEntry} logMap - Convert result data or an error to a LogEntry
 * @param {Request} [req] - Request object to extract user and session IDs
 * @param {boolean} splitArgs - If true, split 'text' & 'args' into multiple statements.
 * @param {Object} client - DB Client Connection to use instead of default.
 * @returns - Result of query
 */
const query = (text, args, logMap, req, splitArgs, client) => db.query(text, args, splitArgs, client).then(async (res) => {
    if (res?.length) await addEntries(res.flatMap((data) => logMap(data)), req)
    else await addEntries(logMap(null, "No result from DB operation. Most likely because no matches were found."), req)
    return res
}).catch(async (error) => {
    await addEntries(logMap(null, error?.message || error?.toString() || "Unknown error"), req)
    throw error
});


/**
 * Simple logging for password attempts
 * @param {Request} req - Request object to extract user and session IDs
 * @param {string} error - Error message of login attempt (Or null if login was successful)
 * @param {string} name - Name of user attempting to login
 * @returns 
 */
const login = (req, error, name) => addEntries({
    dbtable: TableName.PLAYER,
    action: LogAction.LOGIN,
    data: error ? null : { success: true },
    tableid: name || req.session.user,
    error,
}, req).then(() => error)


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
 * @property {string} sessionid - The ID of the user who made the change.
 * @property {string} [error] - Error message if the update failed, otherwise null.
 * @property {Date} ts - The timestamp of the update.
 */


module.exports = {  
    get, getEvent, getPlayer, getUser, getUserSessions,
    addRows, updateRows, rmvRows, query, 
    login,
    addEntries, rmvEntries, 
    LogAction, TableName,
}
