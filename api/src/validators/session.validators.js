const validate = require('./shared.validators').bySet('player')

module.exports = {
  login:   validate(null, ['name', 'password']),
  session: validate(null, ['session']),
  idSession: validate('id', ['session']),
}
