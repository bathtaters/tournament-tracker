
// Count the total number of columns
export const colCount = (layout) =>
  layout.reduce((sum,col) => sum + (!col.span || typeof col.span !== 'number' ? 1 : col.span), 0)


// Get cell key from row & col IDs
export const cellKey = (rowId, colId) => `${rowId || '_NA_'}_${colId || '_NONE_'}`


// Get value of cell based on col (AKA column layout data)
export function getCellValue(col, rowId, index, extra) {  
  // Empty column
  if (!col.get) return col.default ?? ''

  // Number column
  if (col.get === 'index') return index + 1
  
  // Get function
  let value = typeof col.get === 'function' ? col.get(rowId, extra, index) : col.get

  // Default value on null/undef
  if (value == null) return col.default ?? ''

  // Format & return value
  return typeof col.format === 'function' ? col.format(value) : value
}
