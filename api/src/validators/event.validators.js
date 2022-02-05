const validate = require('./shared.validators').bySet('event')

module.exports = {
  eventid:     validate('id'),
  createEvent: validate(null, 'all', 1),
  updateEvent: validate('id', 'all', 1),
}