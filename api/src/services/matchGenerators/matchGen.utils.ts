// --- SHARED UTILITIES FOR GENERATING MATCHES --- \\
import {
  getCombinations,
  getUniqueCombinations,
} from "../../utils/combination.utils";
import { shuffle } from "../../utils/shared.utils";

// --- BASIC MATH OPS --- \\

/**
 * Count item frequency in array
 * @param item - Item to count
 * @param array - Array of items
 * @returns Frequency of 'item' occurrences in 'array'
 */
export const count = (item: any, array?: any[]): number =>
  array ? array.filter((elem) => elem === item).length : 0;

/**
 * Sum elements in array
 * @param array - Array of numbers
 * @returns Sum of array
 */
export const sum = (array: number[]): number =>
  array.reduce((tot, n) => tot + n, 0);

/**
 * Average elements in array
 * @param array - Array of numbers
 * @returns Average of array
 */
export const avg = (array: number[]): number =>
  !array.length ? 0 : array.length === 1 ? array[0] : sum(array) / array.length;

/**
 * Non-negative difference between 2 numbers
 * @param a - Operand 1
 * @param b - Operand 2
 * @returns Non-negative difference in operands
 */
export const diff = (a: number, b: number): number => (a > b ? a - b : b - a);

// --- ARRAY OPS --- \\

/**
 * Return an array of the items in array A that are not in B
 * @param base - Base input array, items should not repeat
 * @param array - Array to subtract from base, can be multidimensional
 * @returns An array containing items in array A that are not in array B.
 */
export function remaining<T>(base: T[], array: T[][]): T[] {
  let remain = [...base];
  if (!array) return remain;

  for (const items of array) {
    for (const item of items) {
      const idx = remain.indexOf(item);
      if (idx >= 0) remain.splice(idx, 1);
    }
  }
  return remain;
}

// --- COMBINATION OPS --- \\

/**
 * Generate every unique group of size 'width' from 'array' elements
 * @param array - Input elements
 * @param width - Max size of each group
 * @returns Array of arrays containing each group as an array
 */
export function* getGroups<T>(array: T[], width: number): Generator<T[][]> {
  // Enforce width limits, avoid infinite loops
  if (width < 1) width = 1;
  else if (width > array.length) width = array.length;

  const gamesPerRound = Math.floor(array.length / width);
  const remainder = array.length % width;

  // Get all possible player groupings
  const matches = [...getCombinations(array, width)];

  for (const round of getUniqueCombinations(matches, gamesPerRound)) {
    if (remainder) round.push(remaining(array, round));
    yield round;
  }
}

/**
 * Generate the first grouped set of size 'width' from 'array' elements
 * @param array - Input elements
 * @param width - Max size of each group
 * @param isDutch - Split using dutch pairing rules
 * @returns Array of arrays containing each group as an array
 */
export function getGroupsSimple<T>(
  array: T[],
  width: number,
  isDutch = false,
): T[][] {
  let result: T[][] = [];

  if (isDutch) {
    const grpSize = Math.trunc(array.length / width);
    let idx = 0;

    for (let slot = 0; slot < width; slot++) {
      for (let grp = 0; grp < grpSize; grp++) {
        if (!slot) result[grp] = [array[idx++]];
        else result[grp].push(array[idx++]);
      }
    }
    if (idx < array.length) result.push(array.slice(idx));
  } else {
    let current: T[] = [];

    for (const entry of array) {
      current.push(entry);
      if (current.length >= width) {
        result.push(current);
        current = [];
      }
    }
    if (current.length > 0) result.push(current);
  }
  return result;
}

/**
 * Find the entry nearest to the index that fulfills the given predicate.
 * @param array - Array to find an entry within
 * @param index - Index of item to start the search next to
 * @param predicate - Function returning True will match this entry
 * @returns Entry matching the predicate or undefined if no matches were found
 */
export function findNearest<T>(
  array: T[],
  index: number,
  predicate: (entry: T, idx: number) => boolean,
): T | undefined {
  for (let l = index - 1, r = index + 1; l >= 0 || r < array.length; ) {
    if (r < array.length) {
      if (predicate(array[r], r)) return array[r];
      r++;
    }
    if (l >= 0) {
      if (predicate(array[l], l)) return array[l];
      l--;
    }
  }
  return undefined;
}

// --- RANDOMIZE/2D-IZE ARRAY --- \\

/**
 * Randomize & Un-flatten array
 * Create 2-D array, randomly grouping every 'elemSize' elements
 * @param array - Input array
 * @param groupSize - Size of innerArrays in result
 * @returns 2-D result array
 */
export function randomGroup<T>(array: T[], groupSize?: 0): T[];
export function randomGroup<T>(array: T[], groupSize: number): T[][];
export function randomGroup<T>(array: T[], groupSize = 0): T[][] | T[] {
  array = shuffle(array.slice());
  if (groupSize < 1) return array;
  let newArr = [] as T[][];
  for (let i = 0; i < array.length; i += groupSize) {
    newArr.push(array.slice(i, i + groupSize));
  }
  return newArr;
}
