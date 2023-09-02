const validate = require('./shared.validators').bySet('voter')

module.exports = {
  playerid:     validate('id'),
  newPlayer:    validate(null, 'id'),
  updatePlayer: validate('id', 'all', 1),
}
