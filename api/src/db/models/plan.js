/* *** PLAN Object *** */
const log = require('./log')
const sql = require('../sql/strings').plan

// Set multiple events to given dates [{ id, ...data }]
const multiset = (plan, userid) => log.updateRows('event', plan, { types: {
    id:      'UUID',
    day:     'DATE',
    players: 'UUID[]',
    slot:    'SMALLINT',
} }, userid)

// De-schedule all un-planned events, schedule all planned events
const update = (update, id, idCol, userid) => log.updateRows('event', id, update, userid, { idCol, returnArray: true })

// Remove all voters/planned events and settings
const reset = (userid) => log.query(sql.reset, null, (_, error) => [
    { dbtable: log.TableName.VOTER,    action: log.LogAction.DELETE, tableid: '*',         userid, error },
    { dbtable: log.TableName.EVENT,    action: log.LogAction.UPDATE, tableid: '*', data: { plan: false }, userid, error },
    { dbtable: log.TableName.SETTINGS, action: log.LogAction.DELETE, tableid: 'plandates', userid, error },
    { dbtable: log.TableName.SETTINGS, action: log.LogAction.DELETE, tableid: 'planslots', userid, error },
])

module.exports = { multiset, update, reset }