
// Convert between values
exports.asType = ({value, type}) => {
  switch(type) {
    case 'string': return value;
    case 'bigint':
    case 'number': return +value;
    case 'date': return new Date(value);
    case 'boolean':
    case 'object':
    default: return value ? JSON.parse(value) : value;
  }
};
const toType = (value, type) => {
  switch(type) {
    case 'string': return value;
    case 'bigint':
    case 'number': return value.toString();
    case 'date':
    case 'boolean':
    case 'object': 
    default: return JSON.stringify(value);
  }
};
exports.getType = (value,forceType) => ({ 
  value: toType(value, forceType || typeof value),
  type: forceType || typeof value
});