// Builder for providesTags and invalidatesTags
// Returns function that will work as either property
import { debugLogging } from "../../assets/config";

// Constants
const DEF_KEY = 'id';
export const ALL_ID = '_LIST'; 
export const tagTypes = ['Settings', 'Schedule', 'Event', 'Match', 'Player', 'PlayerDetail', 'Stats'];

// Helper, gets value from key string (keyStr='propA.propB.0' would get <obj>.propA.propB[0])
const getVal = (obj,keyStr) => keyStr ? obj && [obj].concat(keyStr.split('.')).reduce(function(a, b) { return a && a[b] }) : obj;

// Get Tags - Parameters
//  types:
//    array: [ 'TagType', ... ]
//    object: { TagType: 'keyString' to tagId || (responsePart, key, originalArgs) => tagId }
//  Options:
//    key = key value in object to use as tag id,
//    all = add ALL_ID tag to types
//    addBase = add this array of tags unchanged
//    addAll = add this array of tag types w/ ALL_ID ids
//    limit > 0 will only look at the first <limit> results
export default function getTags(types, { key=DEF_KEY, all=true, addBase=[], addAll=[], limit=0 } = {}) {
  //  Pre-build function w/ static data

  // Normalize 'types' input
  if (typeof types !== 'object') types = types ? {[types]: key} : {};
  else if (Array.isArray(types)) types = types.reduce((obj,t) => {obj[t] = key; return obj;},{});

  // Build tag base
  if (all) addAll = (addAll || []).concat(Object.keys(types));
  const baseTags = (addBase || []).concat(addAll.map(type => ({ type, id: ALL_ID })));

  // Create 'getId' function
  const getId = (type, r, a, k=null) => typeof types[type] === 'function' ? types[type](r,k,a) : getVal(r,types[type]);


  // Return callback for [provides|invalidates]Tags
  return (res,err,arg) => {
    // Handle error
    if (err && debugLogging) console.error('Query error on '+JSON.stringify(types)+':'+JSON.stringify(arg), err);

    let tags = [...baseTags], i;

    // Array response
    if (Array.isArray(res) && res.length) {
      for (const type in types) {
        i = 0;
        for (const r of res) {
          if (limit && ++i > limit) break;
          const id = getId(type, r, arg, i);
          if (id) tags.push({ type, id });
        }
      }

    // JSON response
    } else if (res && typeof res === 'object' && Object.keys(res).length) {
      for (const type in types) {
        if (typeof types[type] !== 'function' && getVal(res, types[type])) {
          tags.push({ type, id: getVal(res, types[type]) });
          continue;
        }
        i = 0;
        for (const r in res) {
          if (limit && ++i > limit) break;
          const id = types[type] ? getId(type, res[r], arg, r) : r;
          if (id) tags.push({ type, id });
        }
      }

    // Any other response (Or empty Array/JSON)
    } else {
      for (const type in types) {
        if (typeof types[type] === 'function') {
          const id = getId(type, res, arg);
          if (id) tags.push({ type, id });
        }
      }
    }
    return tags;
  };
}
