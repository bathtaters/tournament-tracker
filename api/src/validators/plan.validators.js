const validate = require('./shared.validators').bySet('planplayer')

module.exports = {
  playerid:     validate('id'),
  newPlayer:    validate(null, 'id'),
  updatePlayer: validate('id', 'all', 1),
}
