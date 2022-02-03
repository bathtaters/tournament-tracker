const { validationResult } = require('express-validator')

const errorFormatter = ({ param, msg, value }) =>  `${param} ${msg}: ${JSON.stringify(value)}`

// Test validation middleware (Run after running other validators)
const checkValidation = (req, _, next) => {
  const validErrors = validationResult(req)
  if (!validErrors.isEmpty())
    next({ 
      message: 'Validation failed',
      stack: 'Validation failed:\n\t'+validErrors.formatWith(errorFormatter).array().join('\n\t'),
      status: 400,
    })
  next()
}

module.exports = checkValidation