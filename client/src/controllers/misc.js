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