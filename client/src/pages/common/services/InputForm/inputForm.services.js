import React from "react"

// Collect all default values
export const getDefaultValues = (rows, defaults) => flatReduce(rows, ({ id, defaultValue }, defs) => {
  if (id) defs[id] = defaultValue ?? defaults?.[id] ?? ''
})

// Collect all setValueAs functions
export const getSetters = (rows) => flatReduce(rows, ({ id, setValueAs }, setters) => {
  if (id && typeof setValueAs === 'function') setters[id] = setValueAs
})

// Sanitize empty, non-dot fields and apply setValueAs functions
const dotRegex = /\S\.\S/
export const submitSanitize = (data, setters) => {
  const result = {}
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && !dotRegex.test(key)) {
      result[key] = key in setters ? setters[key](val, data) : val
    }
  }
  return result
}

// Convert dot notation to nested JSON
export function resolveDotNotation(obj) {
  const result = {}

  for (const key in obj) {
    const parts = key.split('.')
    let current = result

    // Walk down path
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        // Add object for alpha key, array for numeric key
        current[part] = isNaN(Number(parts[i+1])) ? {} : []
      }
      current = current[part]
    }
    
    // Assign value
    current[parts[parts.length - 1]] = obj[key]
  }

  return result
}


// Get key for row map
export const getRowKey = (row, i, keySuff) => {
  if (!row) return `Null${keySuff}:${i}`
  if (React.isValidElement(row)) return `Elem${keySuff}:${i}`
  if (Array.isArray(row)) return `Wrapper${keySuff}:${i}`
  if (row === 'custom') return `Custom${keySuff}:${i}`

  if (typeof row === 'string') row = {type: row}

  if (row.type === 'spacer') return `Spacer${keySuff}:${i}`
  return row.id || `${row.label || 'Key'}${keySuff}:${i}`
}


// array.reduce for nested array (Like array.flatMap is to array.map)
const flatReduce = (nestedArray, callback, initalValue = {}) => {
  if (Array.isArray(nestedArray)) nestedArray.forEach((next) => flatReduce(next, callback, initalValue))
  else callback(nestedArray, initalValue)
  return initalValue
}
