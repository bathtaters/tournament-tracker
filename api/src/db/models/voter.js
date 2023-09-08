/* *** VOTER Object *** */
const db = require('../admin/interface')
const sql = require('../sql/strings').voter

// Get single or all vote data
const get = (id) => db.getRow('voter', id)

// Add player as voter
const add = (ids) => db.query(sql.add, [ids])

// Remove player as voter
const rmvOther = (ids) => db.query(sql.rmv, [ids])

// Set player's votes
const set = (id, newData) => db.updateRow('voter', id, newData)

// Remove all voters/planned events and settings
const reset = () => db.query(sql.reset)

module.exports = { get, add, rmvOther, set, reset }
