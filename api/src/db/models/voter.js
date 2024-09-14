/* *** VOTER Object *** */
const db = require('../admin/interface')
const log = require('./log')
const sql = require('../sql/strings').voter

// Get single or all vote data
const get = (id) => db.getRow('voter', id)

// Add player as voter
const add = (ids, req) => log.query(sql.add, [ids], (data, error) =>
    error ? ids.map((tableid) => ({
        dbtable: log.TableName.VOTER,
        action: log.LogAction.CREATE,
        data: { id: tableid },
        tableid, error,
    })) : {
        dbtable: log.TableName.VOTER,
        action: log.LogAction.CREATE,
        tableid: data.id,
        data,
    },
    req,
)

// Remove player as voter
const rmvOther = (ids, req) => log.query(sql.rmv, [ids], (data, error) =>
    error ? {
        dbtable: log.TableName.VOTER,
        action: log.LogAction.DELETE,
        tableid: `NOT IN (${ids.join(',')})`,
        error,
    } : {
        dbtable: log.TableName.VOTER,
        action: log.LogAction.DELETE,
        tableid: data.id,
        data,
    },
    req,
)

// Set player's votes
const set = (id, newData, req) => log.updateRows('voter', id, newData, req)

module.exports = { get, add, rmvOther, set }
