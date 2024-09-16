const validate = require('./shared.validators').bySet('player')

module.exports = {
  login:   validate(null, ['name', 'password']),
  idSession: validate('id', ['session']),
}
