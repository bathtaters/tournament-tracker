const validate = require('./shared.validators')
const event = validate.bySet('event')
const plan = validate.bySet('plan')

module.exports = {
  eventid:     event('id'),
  rounds:      event(['id','roundactive']),
  createEvent: event(null, 'all', 1),
  updateEvent: event('id', 'all', 1),
  setPlan:     plan(null, 'events'),
}
