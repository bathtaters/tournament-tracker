import React from "react"

// Collect all default values
export const getDefaultValues = (rows, defaults) => flatReduce(rows, ({ id, defaultValue }, defs) => {
  if (id) defs[id] = defaultValue ?? defaults?.[id] ?? ''
})

// Merge defaults w/ current values
export const updateDefaults = (defaultValues, currentData) => Object.keys(defaultValues).reduce((values, id) => {
  values[id] = currentData[id] ?? defaultValues[id] ?? ''
  return values
}, {})

// Erase props for which the predicate returns TRUTHY
export const eraseProps = (obj, predicate) => Object.keys(obj).forEach((key) => { if (predicate(obj[key], key)) delete obj[key] }) || obj

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

// Find data in a nested array
export const findNested = (nestedArray, predicate) => {
  if (Array.isArray(nestedArray)) {
    for (const item of nestedArray) {
      const result = findNested(item, predicate)
      if (result) return result
    }
  }
  else if (predicate(nestedArray)) return nestedArray
}

// array.reduce for nested array (Like array.flatMap is to array.map)
const flatReduce = (nestedArray, callback, initalValue = {}) => {
  if (Array.isArray(nestedArray)) nestedArray.forEach((next) => flatReduce(next, callback, initalValue))
  else callback(nestedArray, initalValue)
  return initalValue
}

