// Get Counter value to display
export const getDispVal = (val, suff) =>
  val + (typeof suff === 'function' ? suff(val) : suff || '');

// Handle click increase
export const incController = (setVal, val, maxVal) =>
  () => setVal((val + 1) % (maxVal + 1));