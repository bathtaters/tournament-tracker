// -- Common Utility Functions -- //
const logger = require('./log.adapter');
const { randomInt } = require('crypto');


/**
 * Converts object array into result object using input from arrToObj
 * @callback convertArray 
 * @param {Object[]} objArray - Array of objects to be converted
 * @returns {Object} Result object
 */
/**
 * Convert array of objects into a result object using 'key' field in each entry as that entry's key
 * @param {String} key - Key of array entry property to use as unique key in result object
 * @param {Object} options - Additional options for conversion
 * @param {Boolean} [options.delKey=false] - Truthy will delete entry['key'] after assigning it to result object['key']
 * @param {Boolean} [options.combo=false] - Truthy will combine matching keys as array, otherwise throws error
 * @param {String} [options.valKey] - If entered will use entry['valKey'] instead of entry in result object 
 * @returns {convertArray:Object} function to convert input array into result object
 */
exports.arrToObj = (key, { delKey=false, valKey=null, combo=false }={}) => (obj) => {
  if (typeof obj !== 'object') {
    if (obj) logger.warn('Expected object:',typeof obj,obj)
    return obj
  }

  const result = {}
  if (!Array.isArray(obj)) obj = [obj] // Force non-arrays to process as arrays
  for (const entry of obj) {
    // Get entry's 'key'
    const resKey = entry?.[key]
    if (!resKey) {
      logger.warn('Entry is missing key:', key, entry)
      continue
    }

    // Get entry's 'value' according to options
    const value = valKey ? entry[valKey] :
      delKey ? minusKey(entry, key) : { ...entry }
    
    if (!(resKey in result)) {
      result[resKey] = combo ? [value] : value
    } else if (combo) { // Duplicate keys if combo is TRUE
      result[resKey].push(value)
    } else { // Duplicate keys if combo is FALSE
      throw new Error(`Object has duplicate key: [${key}] = ${resKey}`)
    }
  }
  return result
}

/** Return a copy of obj without the specified key -- arrToObj helper */
const minusKey = (obj, rmvKey) => Object.keys(obj).reduce(
  (res, key) => key === rmvKey ? res : ({ ...res, [key]: obj[key] }),
  {}
)

/** Fischer-Yates shuffle algorithm
 *    - Reorder array in place, returning array */
exports.shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = randomInt(currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/**
 * Tests if 'entry' should be before 'item' in array.
 * @callback isBefore 
 * @param {*} entry - Array entry being tested
 * @param {*} item - Item to be inserted
 * @returns {Boolean} If 'entry' is ordered before 'item'
 */
/**
 * Place 'item' into 'array' in order.
 * This mutates the array & returns it.
 * Based off 'sortedIndex' by 'Web_Designer' on Stack Exchange
 * @param {Array} array - Array to insert into
 * @param {*} item - Item to insert in array
 * @param {isBefore:Boolean} [isBefore=((a,b)=>a<b)] - Callback to test order of items
 * @returns {Array} 'array' with 'item' (Modifys original 'array' also)
 */
exports.insertSorted = (array, item, isBefore = (entry,item) => entry < item) => {
  // Get index
  let low = 0, high = array.length, mid;
  while (low < high) {
      mid = (low + high) >>> 1; // (low + high) / 2
      if (isBefore(array[mid], item)) low = mid + 1;
      else high = mid;
  }
  // Insert item
  array.splice(low, 0, item);
  return array;
};

/**
 * Return each index from an array starting at the midpoint (rounded down),
 *  and moving outwards until the start & end are reached.
 * @param {any[] | number} array - Array to iterate over (Also accepts an array length if asValue=false)
 * @param {boolean} [asValue] - If true yield values instead of keys
 */
exports.midOut = function* (array, asValue = false) {
  let length
  if (Array.isArray(array)) {
    array = array.slice()
    length = array.length - 1
  } else if (typeof array === 'number' && !asValue) {
    length = array - 1
  } else throw new Error(`midOut requires array as parameter: ${array}`)
  if (length < 0) return // Empty array

  const mid = Math.floor(length / 2)
  const end = length - mid
  let offset = 0

  yield(asValue ? array[mid] : mid)
  while (++offset <= end) {
    yield(asValue ? array[mid + offset] : mid + offset)
    if (offset <= mid) yield(asValue ? array[mid - offset] : mid - offset)
  }
}

/**
 * Find the maximum value from an array or object
 * @param {any[] | { [key: string]: any }} items - Array or Object to iterate through
 * @param {(value: any, key: string | number) => number | null} [getValue] - Function to get the value used for max
 *  (Returning null will skip the entry entirely)
 * @returns {any | undefined} - Item from 'items' with the highest value (or undefined if items is empty)
 */
exports.customMax = (items, getValue) => {
  if (typeof items !== 'object' || !items) throw new Error(`customMax expected iterable: ${items}`)
    
    const isArr = Array.isArray(items)
  let max = null, result = undefined
  for (const key in items) {
    const val = getValue ? getValue(items[key], isArr ? +key : key) : items[key]
    if (val == null) continue
    else if (typeof val !== 'number') throw new Error(`getValue expected to return number: ${val}`)
    else if (max == null || val > max) {
      max = val
      result = items[key]
    }
  }
  return result
}

/**
 * Find the minimum value from an array or object
 * @param {any[] | { [key: string]: any }} items - Array or Object to iterate through
 * @param {(value: any, key: string | number) => number | null} [getValue] - Function to get the value used for max
 *  (Returning null will skip the entry entirely)
 * @returns {any | undefined} - Item from 'items' with the lowest value (or undefined if items is empty)
 */
exports.customMin = (items, getValue) => {
  if (typeof items !== 'object' || !items) throw new Error(`customMax expected iterable: ${items}`)
  
  const isArr = Array.isArray(items)
  let min = null, result = undefined
  for (const key in items) {
    const val = getValue ? getValue(items[key], isArr ? +key : key) : items[key]
    if (val == null) continue
    else if (typeof val !== 'number') throw new Error(`getValue expected to return number: ${val}`)
    else if (min == null || val < min) {
      min = val
      result = items[key]
    }
  }
  return result
}

/**
 * Create a shallow copy of 'object' without keys in 'ignoring'
 * @param {Object} object - Object to copy
 * @param {String[]} [ignoring=id] - Keys to ignore when copying
 * @returns {Object} Copied Object
 */
exports.filtering = (object, ignoring = ['id']) => {
  const copy = {};
  Object.keys(object).forEach(key => {
    if (!ignoring.includes(key)) copy[key] = object[key];
  });
  return copy;
};

const isCloneable = (value) => {
    if (value === null || ['string', 'number', 'boolean', 'undefined', 'bigint'].includes(typeof value))
      return true
    if (isDate(value))
      return true
    return false
  }

/** Sanitize data to be passed through a thread (Removes all invalid data) */
exports.threadSanitize = (data) => {
  if (isCloneable(data)) return data
  if (Array.isArray(data)) return data.map(exports.threadSanitize)
  if (typeof data === 'object') {
    const sanitized = {}
    for (const key in data) {
      const value = exports.threadSanitize(data[key])
      if (value !== undefined) sanitized[key] = value
    }
    return sanitized
  }
  return undefined
}


// DATE FUNCTIONS \\


/** One day in ms */
const oneDay = 24 * 60 * 60 * 1000
/** Returns True if date is a valid date object */
const isDate = (date) => date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date)

/**
 * Rescursively search 'data' for Date objects
 * and convert them to date strings of form YYYY-MM-DD
 * @param {any} data 
 * @returns Copy of data w/ converted dates
 */
exports.toDateStr = (data) => {
  if (typeof data !== 'object' || !data) return data
  if (isDate(data)) return data.toISOString().slice(0,10)

  if (Array.isArray(data)) return data.map(exports.toDateStr)
  return Object.entries(data).reduce((obj, [key,val]) => 
    Object.assign(obj, { [key]: exports.toDateStr(val) }), 
    {}
  )
}

/** 
 * Get the number of days from startDate to endDate (inclusive)
 * @param {Date} startDate - Date to start from
 * @param {Date} endDate - Date to end on
 * @returns {Number} Count of total days in range
 */
exports.getDayCount = (startDate, endDate) => 1 + Math.abs(endDate - startDate) / oneDay

/**
 * Test if two date objects have the same date
 * @param {Date} dateA - Date to test for equality
 * @param {Date} dateB - Date to test for equality
 * @returns {Boolean} True if dates are equal, otherwise False
 */
exports.datesAreEqual = (dateA, dateB) =>
  dateA.getDate()     === dateB.getDate()     &&
  dateA.getMonth()    === dateB.getMonth()    &&
  dateA.getFullYear() === dateB.getFullYear()