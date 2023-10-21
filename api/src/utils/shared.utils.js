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
exports.arrToObj = (key, { delKey=false, valKey=null, combo=false }={}) =>
  obj => typeof obj !== 'object' ? 
    obj && logger.warn('Expected object:',typeof obj,obj) || obj
    :
    (Array.isArray(obj) ? obj : [obj]).reduce((o,e) => {
      if (!e || !e[key]) logger.warn('Entry is missing key:',key,e);
      else if (o[e[key]] && !combo) throw new Error(`Object has duplicate key: [${key}] = ${e[key]}`);
      else if (!combo) o[e[key]] = valKey ? e[valKey] : e;
      else o[e[key]] = (o[e[key]] || []).concat(valKey ? e[valKey] : e);
      if (delKey && !valKey) delete e[key];
      return o;
    }, {});

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
exports.dayCount = (startDate, endDate) => 1 + Math.abs(endDate - startDate) / oneDay

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