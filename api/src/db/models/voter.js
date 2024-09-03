/* *** VOTER Object *** */
const db = require('../admin/interface')
const log = require('./log')
const sql = require('../sql/strings').voter

// Get single or all vote data
const get = (id) => db.getRow('voter', id)

// Add player as voter
const add = (ids, userid) => log.query(sql.add, [ids], (data, error) =>
    error ? ids.map((tableid) => ({
        dbtable: log.TableName.VOTER,
        action: log.LogAction.CREATE,
        data: { id: tableid },
        tableid, userid, error,
    })) : {
        dbtable: log.TableName.VOTER,
        action: log.LogAction.CREATE,
        tableid: data.id,
        data, userid,
    }
)

// Remove player as voter
const rmvOther = (ids, userid) => log.query(sql.rmv, [ids], (data, error) =>
    error ? {
        dbtable: log.TableName.VOTER,
        action: log.LogAction.DELETE,
        tableid: `NOT IN (${ids.join(',')})`,
        userid, error,
    } : {
        dbtable: log.TableName.VOTER,
        action: log.LogAction.DELETE,
        tableid: data.id,
        data, userid,
    }
)

// Set player's votes
const set = (id, newData, userid) => log.updateRows('voter', id, newData, userid)

module.exports = { get, add, rmvOther, set }
