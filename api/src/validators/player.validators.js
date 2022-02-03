const validate = require('./shared.validators').bySet('player')

module.exports = {
  playerId:     validate('id'),
  createPlayer: validate(null, 'all', 1),
  updatePlayer: validate('id', 'all', 1),
}
