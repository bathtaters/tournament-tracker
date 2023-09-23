/* *** PLAN Object *** */
const db = require('../admin/interface')
const sql = require('../sql/strings').plan

// Set multiple events to given dates [{ id, ...data }]
const multiset = (plan) => db.updateRows('event', plan, { types: {
    id:      'UUID',
    day:     'DATE',
    players: 'UUID[]',
    slot:    'SMALLINT',
} })

// De-schedule all un-planned events, schedule all planned events
const update = (update, id, idCol) => db.updateRow('event', id, update, { idCol, returnArray: true })

// Remove all voters/planned events and settings
const reset = () => db.query(sql.reset)

module.exports = { multiset, update, reset }