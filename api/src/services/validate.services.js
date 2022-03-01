// Import
const logger = require('../utils/log.adapter')
const validCfg = require('../config/validation')
const parseInterval = require('postgres-interval')

// Get Error Messages
const errMsg = (type) => 
  `does not exist as ${type}`
const limitErr = ({ min, max }, isStr = false) => 
  `is too ${isStr ? 'long/short' : 'large/small'} (must be between ${min} & ${max}${isStr ? ' characters' : ''})`
const missingErr = (key, type) => 
  `${key} has ${type ? 'invalid' : 'missing'} type definition: ${type || ''}`
const missingInErr = (key) =>
  `${key} missing 'in' array for validation`

// Decode validation types to [fullStr, typeStr, isArray, isOptional]
const typeRegex = /^([^[?]+)(\[\])?(\?)?$/

// Setup date-only parsing
const strictDates = true
const dateOptions = { format: 'YYYY-MM-DD', strict: strictDates, delimiters: ['-'] }

// Setup custom validator/sanitizer for intervals
const validInterval = { options: (value) => /^\d{2}(?::\d{2}){0,2}$/.test(value), errorMessage: 'not a valid interval' }
const sanitInterval = { options: parseInterval }

// Main

function getSchema(key, typeStr, limits, isIn, forceOptional = false) {
  if (!isIn || !isIn.length) throw new Error(missingInErr(key))

  // Get type from typeStr
  const type = (typeStr || '').match(typeRegex)
  if (!type || !type[0]) throw new Error(missingErr(key, typeStr))
  if (forceOptional) type[3] = '?'

  // Initialize ptr & static values (errMsg/in)
  let valid = { [key]: {} }
  let ptr = valid[key]
  ptr.errorMessage = errMsg(type[0])
  ptr.in = isIn

  // Add validation for optionals/non-optionals
  if (type[3]) {
    ptr.optional = { options: { nullable: true } }
  } else {
    ptr.exists = { errorMessage: 'must exist' }
    ptr.notEmpty = { errorMessage: 'must not be empty' }
  }

  // Handle validation for array elements
  if (type[2]) {
    // Set limits
    let arrLimit
    if (limits && (limits.array || limits.elem)) {
      arrLimit = limits.array
      limits = limits.elem
    } else {
      arrLimit = limits
      limits = null
    }
    ptr.isArray = !arrLimit || { options: arrLimit, errorMessage: limitErr(arrLimit, false) }
    
    // Create entry & update ptr
    valid[key+'.*'] = {}
    ptr = valid[key+'.*']

    // Set statics for new entry
    ptr.errorMessage = errMsg(type[1])
    ptr.in = isIn
  }

  // Pass limits as options
  if (limits && (limits.array || limits.elem)) limits = limits.elem
  if (limits) limits = { options: limits, errorMessage: limitErr(limits, type[1] === 'string') }

  // Set type-specific validators/sanitizers
  switch (type[1]) {
    case 'uuid': ptr.isUUID = { options: 4, errorMessage: 'not a valid UUID' } // pass to string
    case 'string':
      ptr.isAscii = { errorMessage: 'contains invalid characters' }
      ptr.stripLow = true
      ptr.trim = true
      ptr.escape = true
      if (limits) ptr.isLength = limits
      break
    case 'float':
      ptr.isFloat = limits || { errorMessage: 'not a valid decimal' }
      ptr.toFloat = true
      break
    case 'int':
      ptr.isInt = limits || { errorMessage: 'not a valid number' }
      ptr.toInt = true
      break
    case 'boolean':
      ptr.isBoolean = { errorMessage: 'not a valid bool' }
      ptr.toBoolean = true
      break
    case 'interval':
      ptr.custom = validInterval
      ptr.customSanitizer = sanitInterval
      break
    case 'datetime':
      ptr.isISO8601 = { options: { strict: strictDates, strictSeparator: strictDates }, errorMessage: 'not a valid timestamp' }
      ptr.toDate = true
      break
    case 'date':
      ptr.isDate = { options: dateOptions, errorMessage: 'not a valid date' }
      ptr.trim = true
      break
    case 'object': ptr.isObject = { errorMessage: 'not a valid object' } // pass to default
    case 'any':  // pass to default
    default: break
  }

  return valid
}

function getSchemaFromCfg(set, key, isIn = ['params'], optionalIfOnlyBody = false) {
  // Determine if optional flag should be forced
  let forceOptional = false
  if (optionalIfOnlyBody) {
    // Remove body tag if other tags
    if (isIn.length > 1) isIn = isIn.filter(t => t !== 'body')
    // Otherwise force optional flag
    else if (isIn[0] === 'body') forceOptional = true
  }

  return exports.getSchema(key, validCfg.types[set][key], validCfg.limits[set][key], isIn, forceOptional)
}

exports.getSchema = getSchema
exports.getSchemaFromCfg = getSchemaFromCfg