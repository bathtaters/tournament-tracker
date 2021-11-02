// Misc Utilities

// Finds key of an object whose value (or value of <innerKey>) equals <value>
export const findObj = (obj, value, innerkey = null) => {
  value = value.toLowerCase();
  return Object.keys(obj).find(k => (innerkey ? obj[k][innerkey] : obj[k]).toLowerCase() === value);
}