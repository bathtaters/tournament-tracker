// --- SHARED UTILITIES FOR GENERATING MATCHES --- \\
import type { Player } from "../../types/models";
import type { TeamData } from "../../types/generators";
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

/**
 * Remove the given 'player's entire team from 'players'
 *  (Or just the player if no team array exists or player is not found.
 * @param player - Player whose team to lookup
 * @param players - Set of players to remove the team/individual from
 * @param teams - Object containing arrays of player IDs corresponding to teams
 */
export const removeTeam = (
  player: Player["id"],
  players: Set<Player["id"]>,
  teams?: TeamData,
) => {
  const team =
    teams && Object.values(teams).find((team) => team.includes(player));
  if (team) {
    team.forEach((p) => players.delete(p));
  } else {
    players.delete(player);
  }
};

/**
 * Convert an object of arrays into a map of the array entries to their keys.
 * @param arrayObj - { key: [...entries], ... }
 * @returns - { entry: key, ... }
 */
export const invertArrayObj = <
  T extends string | number | symbol,
  K extends string | number | symbol,
>(
  arrayObj: Record<K, T[]>,
) =>
  (Object.entries(arrayObj) as [K, T[]][]).reduce(
    (invObj, [key, values]) =>
      values.reduce((subObj, value) => ({ ...subObj, [value]: key }), invObj),
    {} as Record<T, K>,
  );

/**
 * Sort array by mapped value
 * @param sortMap - Object with array entries as keys and sort keys as values
 * @returns - Function to sort a given array according to sortMap
 */
export const sortByKey =
  <T extends string | number | symbol>(sortMap: Record<T, any>) =>
  (array: T[]) =>
    array.sort((a, b) => (sortMap[a] < sortMap[b] ? 1 : -1));

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

/**
 * Create 2-D array from team data, randomly grouping every 'elemSize' elements,
 *  preventing players on the same team from being grouped together.
 * @param teams - Object containing arrays of team members as values.
 * @param groupSize - Size of innerArrays in result
 * @returns 2-D result array
 */
export function randomTeamGroup<T extends string | number | symbol>(
  teams: Record<any, T[]>,
  groupSize: number,
): T[][] {
  if (groupSize < 1) throw new Error("groupSize required");

  // Convert to 2D array & randomize inner arrays
  const teamGroups: T[][] = shuffle(Object.values(teams).map(shuffle));

  // Build groups using the algorithm
  const result: T[][] = [];
  while (teamGroups.some((group) => group.length > 0)) {
    // 1) Sort (larger to shorter arrays)
    teamGroups.sort((a, b) => b.length - a.length);
    const nextGroup: T[] = [];
    for (let idx = 0; idx < groupSize; idx++) {
      if (teamGroups[idx].length < 1) break; // Stop if the array is empty
      // 2) Take the last item from the first 'groupSize' arrays
      nextGroup.push(teamGroups[idx].pop());
    }
    result.push(nextGroup);
  }

  // Sort groups by team IDs
  return result;
}
