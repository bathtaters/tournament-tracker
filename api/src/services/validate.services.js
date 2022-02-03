// Import
const logger = require('../utils/log.adapter')
const validCfg = require('../config/validation')
const parseInterval = require('postgres-interval')

// Get Error Messages
const errMsg = (type) => 
  `failed validation for <${type}>`
const missingErr = (key, type) => 
  `${key} has invalid or missing type definition: ${type || '(Missing)'}`
const missingInErr = (key) =>
  `${key} missing 'in' array for validation`

// Decode validation types to [fullStr, typeStr, isArray, isOptional]
const typeRegex = /^([^[?]+)(\[\])?(\?)?$/

// Setup date-only parsing
const strictDates = true
const dateOptions = { format: 'YYYY-MM-DD', strict: strictDates, delimiters: ['-'] }

// Setup custom validator/sanitizer for intervals
const validInterval = { options: (value) => /^\d{2}(?::\d{2}){0,2}$/.test(value) }
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
    ptr.exists = true
    ptr.notEmpty = true
  }

  // Handle validation for array elements
  if (type[2]) {
    // Set limits
    let arrLimit = limits
    if (limits && (limits.array || limits.elem)) {
      arrLimit = limits.array
      limits = limits.elem
    } else {
      limits = null
    }
    ptr.isArray = !arrLimit || { options: arrLimit }
    
    // Create entry & update ptr
    valid[key+'.*'] = {}
    ptr = valid[key+'.*']

    // Set statics for new entry
    ptr.errorMessage = errMsg(type[1])
    ptr.in = isIn
  }

  // Pass limits as options
  if (limits && (limits.array || limits.elem)) limits = limits.elem
  if (limits) limits = { options: limits }

  // Set type-specific validators/sanitizers
  switch (type[1]) {
    case 'uuid': ptr.isUUID = { options: 4 } // pass to string
    case 'string':
      ptr.isAscii = true
      ptr.stripLow = true
      ptr.trim = true
      ptr.escape = true
      if (limits) ptr.isLength = limits
      break
    case 'float':
      ptr.isFloat = limits || true
      ptr.toFloat = true
      break
    case 'int':
      ptr.isInt = limits || true
      ptr.toInt = true
      break
    case 'boolean':
      ptr.isBoolean = true
      ptr.toBoolean = true
      break
    case 'interval':
      ptr.custom = validInterval
      ptr.customSanitizer = sanitInterval
      break
    case 'datetime':
      ptr.isISO8601 = { options: { strict: strictDates, strictSeparator: strictDates } }
      ptr.toDate = true
      break
    case 'date':
      ptr.isDate = { options: dateOptions }
      ptr.trim = true
      break
    case 'object': ptr.isObject = true // pass to default
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