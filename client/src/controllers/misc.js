// Misc Utilities

// Finds key of an object whose value (or value of <innerKey>) equals <value>
export const findObj = (obj, value, innerkey = null) => {
  value = value.toLowerCase();
  return Object.keys(obj).find(k => (innerkey ? obj[k][innerkey] : obj[k]).toLowerCase() === value);
}

// Checks that 2 arrays are equal (Must be 1D arrays, 2 falsy vars will also be equal)
export const equalArrays = (a,b) =>
  (!a && !b) || (a && b && 
    a.length === b.length && 
    a.every((v,i) => b[i] === v)
  );

// Radomizes an array, optionally trimming it to a specific size
export const randomArray = (arr, size) => {
  if (typeof size !== 'number' || size > arr.length) size = arr.length;
  let res = [], rem = arr.slice();
  for (let i = 0; i < size; i++) {
    res.push(rem.splice(Math.floor(Math.random()*rem.length), 1)[0]);
  }
  return res;
};

// Generates a temporary ID
const TEMP_ID_PREFIX = 'TEMPID'
export const isTempId = id => id.slice(0,TEMP_ID_PREFIX.length) === TEMP_ID_PREFIX;
const tempId = type => n => `${TEMP_ID_PREFIX}-${type}-${('0000'+n).slice(-4)}`;
export const nextTempId = (type, exists) => {
  if (!exists) return tempId(type)(0);
  let n = 0, id; const getId = tempId(type);
  while (++n < 10000) { 
    id = getId(n);
    if (!exists.includes(id)) break;
  } return id;
}

// Build a playerId list from rank (Include missing players if listAll=true)
export const getPlayerList = (ranking, players, listAll=false) => {
  if (!players) return ranking || [];
  let list = [];
  if (ranking) {
    list = ranking.filter(p => players[p]);// && !players[p].isteam);
    if (listAll) list.push(...Object.keys(players).filter(p => !ranking.includes(p)));
  } else if (listAll) list.push(...Object.keys(players));
  return list;
}