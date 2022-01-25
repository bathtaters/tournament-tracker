const logger = require('../utils/log.adapter');

// Convert between values
exports.asType = ({value, type}) => {
  switch(type) {
    case 'string': return value;
    case 'bigint':
    case 'number': return +value;
    case 'date': return new Date(value);
    case 'boolean':
      return !value || value === 'false' ? false : true;
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
      if (typeof value.toISOString === 'function')
        return value.toISOString();
      else logger.warn('non-date passed as date',value);
    case 'boolean':
      return !value || value === 'false' ? 'false' : 'true';
    case 'object': 
    default: return value && JSON.stringify(value);
  }
};
const getType = (value,forceType) => {
  let type = forceType || typeof value;
  if (type === 'object' && value && typeof value.getMonth === 'function')
    type = 'date';
  return { value: toType(value, type), type, };
}
exports.toObjArray = settings => 
  Object.keys(settings).map(id =>
    ({ ...getType(settings[id]), id })
  );