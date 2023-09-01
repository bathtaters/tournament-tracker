// -- Common Utility Functions -- //
const logger = require('./log.adapter');


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
