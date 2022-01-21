// -- Helper functions for PG interface -- //

// Test for SQL injection
exports.strTest = str => {
  if (Array.isArray(str)) return str.map(exports.strTest);
  if(typeof str !== 'string') str = str.toString();
  if(/\s|;/.test(str))
    throw new Error("Possible SQL injection: "+str);
  return str;
};

// Build labels for SQL based on array.length & keys.length (ie. $1, $2, $3)
exports.queryLabels = (objArray, keys) => {
  const size = Array.isArray(keys) ? keys.filter(k=>k!==undefined).length : +keys;
  if (!size) return '';
  return objArray.map((_,idx) => `(${
      [...Array(size)].map((_,i) => '$'+(idx*size+i+1)).join(', ')
  })`);
};

// Get args from objArray based on keys (ie. objArray[0][keys[0]], etc)
exports.queryValues = (objArray, keys) => objArray.flatMap(colObj => 
  keys.filter(k=>k!==undefined).map(k => colObj[k])
);

// Process results
const pgReturnKey = 'rows';

exports.getFirst = (additBool=true) => res =>
  additBool && Array.isArray(res) && res[0] ? res[0] : res;

exports.getReturn = res =>
  Array.isArray(res) ? res.map(r => (r && r[pgReturnKey]) || r) :
  (res && res[pgReturnKey]) || res;

exports.lineCount = qry => qry ? (qry.match(/;|\S\s*$/g) || []).length : 0; // SQL line counter
exports.getSolo = qry => {
    if (Array.isArray(qry) && qry.length !== 1)
      return r => r;
    if (typeof qry === 'string' && exports.lineCount(qry) !== 1)
      return r => r;
    return r => exports.getFirst(r.length === 1)(r);
};
