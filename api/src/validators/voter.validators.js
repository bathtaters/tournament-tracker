const validate = require('./shared.validators')
const voter = validate.bySet('voter')
const plan = validate.bySet('plan')

module.exports = {
  playerid:    voter('id'),
  setVoters:   plan(null, 'voters'),
  updateVotes: voter('id', 'all', 1),
}
