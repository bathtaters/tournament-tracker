/* *** PLAN Object *** */
const log = require('./log')
const sql = require('../sql/strings').plan

// Set multiple events to given dates [{ id, ...data }]
const multiset = (plan, req) => log.updateRows('event', plan, { types: {
    id:      'UUID',
    day:     'DATE',
    players: 'UUID[]',
    slot:    'SMALLINT',
} }, req)

// De-schedule all un-planned events, schedule all planned events
const update = (update, id, idCol, req) => log.updateRows('event', id, update, req, { idCol, returnArray: true })

// Remove all voters/planned events and settings
const reset = (req) => log.query(sql.reset, null, (_, error) => [
    { dbtable: log.TableName.VOTER,    action: log.LogAction.DELETE, tableid: '*',         error },
    { dbtable: log.TableName.EVENT,    action: log.LogAction.UPDATE, tableid: '*', data: { plan: false }, error },
    { dbtable: log.TableName.SETTINGS, action: log.LogAction.DELETE, tableid: 'plandates', error },
    { dbtable: log.TableName.SETTINGS, action: log.LogAction.DELETE, tableid: 'planslots', error },
], req)

module.exports = { multiset, update, reset }