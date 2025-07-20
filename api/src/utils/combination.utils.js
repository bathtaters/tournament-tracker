/** Calculate count of all possible combinations of array items in slotCount slots */
const combinationCount = (arrayLen, slotCount) =>
  slotCount &&
  Math.round(fact(arrayLen) / (fact(slotCount) * fact(arrayLen - slotCount)));

/**
 * Test if any combination of indexes does not include a match.
 * @param {number[]} indexes - List of indexes to check
 * @param {number[][]} matches - Array containing matching indexes for each index
 * @returns {bool} - True if all indexes are matches
 */
const isUnique = (indexes, matches) => {
  for (let a = 0; a < indexes.length; a++) {
    for (let b = a + 1; b < indexes.length; b++) {
      if (!matches[indexes[a]].includes(indexes[b])) return false;
    }
  }
  return true;
};

/**
 * Generate a matches array for isUnique, checks for duplicate base-level items before approving a match
 * @param {any[][]} array - 2D Array to check for matching inner elements
 * @returns {number[][]} - input array indexes that for which the index they are placed at should match
 */
const generateMatches = (array) =>
  array.map((base) =>
    array
      .map((_, i) => i)
      .filter((i) => array[i].every((item) => !base.includes(item)))
  );

/** Get the Nth combination of array items in slotCount slots
 *   No empties, order doesn't matter, comboCount = result of combinationCount() */
function getCombinationN(n, array, slotCount, comboCount) {
  let combo = [],
    len = array.length;

  for (let curIndex = comboCount; slotCount > 0; slotCount--) {
    comboCount = Math.trunc((comboCount * slotCount) / len);

    while (curIndex > n + comboCount) {
      curIndex -= comboCount;
      comboCount *= len - slotCount;
      comboCount = Math.trunc((comboCount - (comboCount % slotCount)) / --len);
    }
    combo.push(array[--len]);
  }
  return combo;
}

/**
 * Generator that yields all unique combinations of array items of the given size.
 *   (No empties, order doesn't matter, combinations will not contain duplicate items)
 * @param {any[][]} array - A 2D array containing base-level items that can be tested for equality.
 * @param {number} size - Size of each combination to return
 * @returns {any[][]} - Next unique array of size 'size'.
 */
function* getUniqueCombinations(array, size) {
  // Handle invalid array length
  if (!array?.length) return;

  // Initialize pointers for each slot (Most active ptr first)
  const slotPtr = Array(size)
    .fill(0)
    .map((_, i) => size - i - 1);
  // Set limits for each pointer
  const limit = slotPtr.map((_, i) => array.length - i - 1);

  // Create a map of indexes that match the given index
  const matches = generateMatches(array);

  slotPtr[0]--; // First iteration fix
  while (true) {
    // Find first pointer that doesn't need to wrap
    let wrapSlot = slotPtr.findIndex((ptr, idx) => ptr < limit[idx]);
    if (wrapSlot === -1) break; // No more pointers left to wrap

    // Wrap all upstream pointers
    while (wrapSlot--) slotPtr[wrapSlot] = ++slotPtr[wrapSlot + 1];

    // Base increment
    ++slotPtr[0];

    // Convert pointers to actual array values
    if (isUnique(slotPtr, matches))
      yield slotPtr.map((idx) => array[idx]).reverse();
  }
}

/**
 * Generator that yields all combinations of array items of the given size.
 *   (No empties, order doesn't matter)
 * @param {any[]} array - Array containing any type of item
 * @param {number} size - Size of each combination to return
 * @returns {any[][]} - Next array of size 'size'
 */
function* getCombinations(array, slotCount) {
  // Handle invalid array length
  if (!array?.length) return;

  // Initialize pointers for each slot (Most active ptr first)
  const slotPtr = Array(slotCount)
    .fill(0)
    .map((_, i) => slotCount - i - 1);
  // Set limits for each pointer
  const limit = slotPtr.map((_, i) => array.length - i - 1);

  slotPtr[0]--; // First iteration fix
  while (true) {
    // Find first pointer that doesn't need to wrap
    let wrapSlot = slotPtr.findIndex((ptr, idx) => ptr < limit[idx]);
    if (wrapSlot === -1) break; // No more pointers left to wrap

    // Wrap all upstream pointers
    while (wrapSlot--) slotPtr[wrapSlot] = ++slotPtr[wrapSlot + 1];

    // Base increment
    ++slotPtr[0];

    // Convert pointers to actual array values
    yield slotPtr.map((idx) => array[idx]).reverse();
  }
}

/** Calculate count of all possible non-repetative combinations of items in slotCount slots, allowing empty slots */
function permutationCount(arrayLength, slotCount, includeBlanks) {
  // Simple permutation formula
  if (!includeBlanks)
    return slotCount > arrayLength
      ? 0
      : fact(arrayLength) / fact(arrayLength - slotCount);

  // Flip array & slots order to prevent negative factorials
  // The variables are interchangable when including blanks
  if (arrayLength < slotCount)
    return permutationCount(slotCount, arrayLength, includeBlanks);

  let sum = 1;
  for (let n = 0; n < slotCount; n++) {
    // For each possibility of empty slots (none to all but one)
    // Calculate the permutations of the occupied slots x the combinations of empty slots
    sum +=
      permutationCount(arrayLength, slotCount - n, false) *
      combinationCount(slotCount, n);
  }
  return sum;
}

/** Get all non-repeating permutations from array of size slotCount (order matters)
 *  includeBlanks will return permutations containing one or more empty slots */
function* getPermutations(array, slotCount, includeBlanks = false) {
  const maxIdx = array.length - +!includeBlanks,
    lastSlot = slotCount - 1;
  let indexes = Array.from({ length: slotCount }, (_, idx) =>
    idx < array.length ? idx : maxIdx
  );

  for (let ptr = lastSlot; ptr >= 0; indexes[ptr]++) {
    if (!hasRepeats(indexes, includeBlanks && maxIdx))
      yield indexes.map((i) => array[i]);

    ptr = lastSlot;
    while (indexes[ptr] === maxIdx) indexes[ptr--] = 0;
  }
}

// HELPERS \\

/** Calculate the factorial of N (non-recursive) */
function fact(n) {
  if (n in factCache) return factCache[n];
  let i, f;
  for (f = i = 1; i <= n; i++) f *= i;
  return f;
}
// Cache factorials up to 170
const factCache = [1];
for (let i = 1; i <= 170; i++) {
  factCache[i] = factCache[i - 1] * i;
}

/** Return true if array has any repeating values,
 * unless the repeated value is ignoreValue */
function hasRepeats(array, ignoreValue) {
  return array.some((val, idx) => {
    if (val === ignoreValue) return false;

    for (let i = idx + 1; i < array.length; i++) {
      if (val === array[i]) return true;
    }
    return false;
  });
}

// EXPORTS \\
module.exports = {
  getUniqueCombinations,
  getCombinationN,
  combinationCount,
  getCombinations,
  permutationCount,
  getPermutations,
};
