const { intervalKeys, intervalString } = require("./dbInterface.utils")

// Decode validation types to [fullStr, typeStr, leaveWhiteSpace (*), isArray ([]|[?]), isOptional (?)]
const typeRegex = /^([^[?*]+)(\*)?(\[\??\])?(\?)?$/
exports.getTypeArray = (typeStr) => typeStr && typeStr.match(typeRegex)

// Setup date-only parsing
const strictDates = true
exports.dateOptions = {
  date: { strict: strictDates, strictSeparator: true },
  time: { strict: strictDates, strictSeparator: strictDates },
}

// Setup custom validator/sanitizer for intervals
exports.customInterval = {
  validate: (value) => {
    if (typeof value !== "object") return false
    return intervalKeys.every((key) => isDigitOrNull(value[key]))
  },
  sanitize: { options: (value) => {
    const result = {}
    intervalKeys.forEach((key) => {
      if (value[key] || value[key] === 0)
        result[key] = Number(value[key])
    })
    result.toPostgres = function() { return intervalString(this) }
    return result
  } },
}
const isDigitOrNull = (value) => typeof value === "number" ? true : value == null ? true :
  typeof value === "string" ? /^\d*$/.test(value) : false


// Count escaped string (each escaped char counts as 1)
const ESC_START = '&', ESC_END = ';', ESC_MAX_INT_LEN = 5 // Escaping params
exports.escapedLength = ({ options, errorMessage }) => ({
  errorMessage,
  options: (value) => {
    if (!options || !options.min && !options.max) return true
    if (typeof value !== 'string') return false

    let count = 0, isEsc = false, reserve
    for (const c of value) {
      if (c === ESC_START) {
        if (reserve) count += reserve
        isEsc = true
        reserve = 0
      } else if (isEsc) {
        const isEnd = c === ESC_END
        if (isEnd || reserve > ESC_MAX_INT_LEN) {
          if (!isEnd) count += reserve
          isEsc = false
          reserve = 0
        }
      }
      isEsc ? reserve++ : count++
    }
    if (reserve) count += reserve
    return (!options.min || count >= options.min) && (!options.max || count <= options.max)
  }
})
