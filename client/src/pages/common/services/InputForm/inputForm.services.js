import React from "react";

// Get key for row map
export const getRowKey = (row, i, keySuff) => {
  if (!row) return `Null${keySuff}:${i}`;
  if (React.isValidElement(row)) return `Elem${keySuff}:${i}`;
  if (Array.isArray(row)) return `Wrapper${keySuff}:${i}`;
  if (row === 'custom') return `Custom${keySuff}:${i}`;

  if (typeof row === 'string') row = {type: row};

  if (row.type === 'spacer') return `Spacer${keySuff}:${i}`;
  return row.id || `${row.label || 'Key'}${keySuff}:${i}`;
};

// Set default value off of baseData if not provided
export const getDefaultValue = (row, data) => {
  if ('defaultValue' in row) return row.defaultValue;
  if (data.defaultValues && row.id && row.id in data.defaultValues) return data.defaultValues[row.id];
};


// Transform results
export const transformObject = (rows, obj={}) => {
  if (Array.isArray(rows)) rows.forEach(r => transformObject(r,obj));
  else if (rows && rows.transform && rows.id) obj[rows.id] = rows.transform;
  return obj;
};

export const transformFunction = (transformObj, oldData, baseData) => data => {
  Object.keys(transformObj).forEach(id => { data[id] = transformObj[id](data[id], oldData, baseData, data) });
  return data;
};


// Handle first onChange event
export const changeController = (isChanged, onEdit, setChanged, onChange) => (ev) => { 
  if (!isChanged) { onEdit && onEdit(); setChanged(true); }
  onChange && onChange(ev);
};
