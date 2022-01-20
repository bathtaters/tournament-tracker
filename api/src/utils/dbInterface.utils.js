// -- Helper functions for PG interface -- //

// Test for SQL injection
exports.strTest = str => {
  if (Array.isArray(str)) return str.forEach(exports.strTest);
  if(typeof str !== 'string') str = str.toString()
  if(/\s|;/.test(str))
    throw new Error("Possible SQL injection: "+str);
};

// Build labels for SQL based on array.length & keys.length (ie. $1, $2, $3)
exports.queryLabels = (objArray, keys) => {
  const size = Array.isArray(keys) ? keys.filter(k=>k!==undefined).length : +keys;
  if (!size) return '';
  return objArray.map((_,idx) => `(${
      [...Array(size)].map((_,i) => '$'+(idx*size+i+1)).join(', ')
  })`);
}

// Get args from objArray based on keys (ie. objArray[0][keys[0]], etc)
exports.queryValues = (objArray, keys) => objArray.flatMap(colObj => 
  keys.filter(k=>k!==undefined).map(k => colObj[k])
);

// Process results
exports.getReturn = res => !res ? res : Array.isArray(res) ? res.map(r => r && (r.rows || r)) : res.rows || res;
exports.getFirst = (additQual=true) => res => additQual && Array.isArray(res) && res[0] ? res[0] : res;
exports.getSolo = qry => {
    if ((Array.isArray(qry) && qry.length !== 1)) return r => r;
    if (typeof qry === 'string' && (qry.match(/;|\S\s*$/g) || []).length !== 1) return r => r;
    return r => r && r.length === 1 && r[0] ? r[0] : r;
};
