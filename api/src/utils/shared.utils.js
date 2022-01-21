// -- Common Utility Functions -- //
const logger = console;

// Convert array of objects into single object using 'key' field as keys
// (Used to index pg return values by ID)
/**
 * Convert array of objects into a result object using 'key' field in each entry as that entry's key
 * @param {string} key - Key of array entry property to use as unique key in result object
 * @param {Object} options - Additional options for conversion
 * @param {boolean} [options.delKey=true] - Truthy will delete entry['key'] after assigning it to result object['key']
 * @param {string} [options.valKey] - If entered will use entry['valKey'] instead of entry in result object 
 * @returns {convertArray} function to convert input array into result object
 */
/**
 * Converts object array into result object using input from arrToObj
 * @callback convertArray 
 * @param {Object[]} objArray - Array of objects to be converted
 * @returns {Object} Result object
 */
exports.arrToObj = (key, { delKey=true, valKey=null }={}) =>
  obj => typeof obj !== 'object' ? 
    obj && logger.warn('Expected object:',typeof obj,obj) || obj
    :
    (Array.isArray(obj) ? obj : [obj]).reduce((o,e) => {
      if (!e || !e[key]) logger.warn('Entry is missing key:',key,e);
      else if (o[e[key]]) throw new Error(`Object has duplicate key: [${key}] = ${e[key]}`);
      else o[e[key]] = valKey ? e[valKey] : e;
      if (delKey && !valKey) delete e[key];
      return o;
    }, {});


/**
 * Place 'item' into 'array' in order.
 * This mutates the array & returns it.
 * Based off 'sortedIndex' by 'Web_Designer' on Stack Exchange
 * @param {Array} array - Array to insert into
 * @param {*} item - Item to insert in array
 * @param {isBefore:boolean} [isBefore=((a,b)=>a<b)] - Callback to test order of items
 * @returns {Array} 'array' with 'item' (Modifys original 'array' also)
 */
/**
 * Tests if 'entry' should be before 'item' in array.
 * @callback isBefore 
 * @param {*} entry - Array entry being tested
 * @param {*} item - Item to be inserted
 * @returns {boolean} If 'entry' is ordered before 'item'
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
