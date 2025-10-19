// CALCs, COMBINERs & SORTER for PLAYER STATS
import { points } from "../config/constants";
import { Event, MatchDetail, Player } from "../types/models";
import {
  Stats,
  StatsEntry,
  StatsEntryBase,
  StatsEntryOpps,
  StatsEntryRates,
} from "../types/generators";

/** Win % calculator */
export const rate = (score: number, record: number[], useFloor = false) =>
  Math.max(
    score / (sumArr(record || []) * points.win),
    useFloor ? points.floor || 0 : 0,
  ); // If no games played, returns NaN

/** Builds player array of 'WLD' index (ie Player Win = 0, Player Loss = 1, Draw = 2) */
export const getWLD = ({
  wins,
  maxwins,
}: Pick<MatchDetail, "wins" | "maxwins">) =>
  wins.filter((w) => {
    if (w === maxwins) return true;
    if (w < maxwins) return false;
    // Catch invalid state
    throw new Error(
      "Invalid maxwins: " + maxwins + " => " + JSON.stringify(wins),
    );
  }).length === 1
    ? wins.map((w) => +(w !== maxwins))
    : wins.map((w) => (w === maxwins ? 2 : 1));
// Draw if player wins == max, otherwise lose

// Calculate Stat Values //

export const calcBase = (
  playerIdx: number,
  wldArr: number[],
  { wins, draws, totalwins }: Pick<MatchDetail, "wins" | "draws" | "totalwins">,
  event: Event["id"],
): StatsEntryBase => ({
  eventIdSet: new Set([event]), // In set for combineFinal
  matchRecord: Object.assign([0, 0, 0], { [wldArr[playerIdx]]: 1 }),
  gameRecord: [wins[playerIdx], totalwins - wins[playerIdx], draws],
  matchScore: [points.win, 0, points.draw][wldArr[playerIdx]],
  gameScore: wins[playerIdx] * points.win, // + ( draws * points.draw ), // ignore draws in game calculation
});

export const calcRates = <T extends Omit<StatsEntryBase, "eventIdSet">>(
  result: T,
  useFloor = false,
) => ({
  ...result,
  matchRate: rate(result.matchScore, result.matchRecord, useFloor),
  gameRate: rate(result.gameScore, result.gameRecord?.slice(0, 2), useFloor),
});

export const calcOpps = <T extends StatsEntryBase>(
  result: T,
  current: Record<Player["id"], StatsEntryRates>,
  oppList: Player["id"][],
  useFloor = false,
) => {
  // Collect
  let oppMatch: number[] = [],
    oppGame: number[] = [];
  oppList &&
    oppList.forEach((oppId) => {
      if (current[oppId]) {
        isNaN(current[oppId].matchRate) ||
          oppMatch.push(current[oppId].matchRate);
        isNaN(current[oppId].gameRate) || oppGame.push(current[oppId].gameRate);
      }
    });
  // Average (In array for combineFinal)
  return {
    ...result,
    oppMatches: [avgArr(oppMatch, useFloor)],
    oppGames: [avgArr(oppGame, useFloor)],
  };
};

// Combining/Finalizing Stat Objects //

/** Add match/game records/scores from 'additional' into 'base' */
export const combineStats = <T extends StatsEntryBase>(entries: T[]) => ({
  ...entries[0],
  matchRecord: addArrays(entries.map(({ matchRecord }) => matchRecord)),
  gameRecord: addArrays(entries.map(({ gameRecord }) => gameRecord)),
  matchScore: entries.reduce((sum, { matchScore }) => sum + matchScore, 0),
  gameScore: entries.reduce((sum, { gameScore }) => sum + gameScore, 0),
});

/** Run 'combineStats', plus add eventIds and opponent arrays from 'additional' into 'base' */
export const combineFinal = <T extends StatsEntryOpps>(entries: T[]) => {
  const result = {
    ...combineStats(entries),
    oppMatches: entries.flatMap(({ oppMatches }) => oppMatches),
    oppGames: entries.flatMap(({ oppGames }) => oppGames),
  };

  // Add additional 'eventIdSet' items to the first one, which is already added in combineStats
  entries.forEach(
    ({ eventIdSet }, notFirst) =>
      notFirst && eventIdSet.forEach((event) => result.eventIdSet.add(event)),
  );
  return result;
};

export const finalize = (
  { eventIdSet, oppMatches, oppGames, ...result }: StatsEntryOpps,
  useFloor = false,
) => {
  // If more than 1 event, recalc rates
  if (eventIdSet.size > 1) result = calcRates(result, useFloor);

  // Average oppRates (Ignoring NaNs)
  return {
    ...result,
    eventids: [...eventIdSet],
    oppMatch: avgArr(
      oppMatches.filter((n) => !isNaN(n)),
      useFloor,
    ),
    oppGame: avgArr(
      oppGames.filter((n) => !isNaN(n)),
      useFloor,
    ),
  } as StatsEntry;
};

/** Determine ranking using MTG rules */
export const rankSort =
  (data: Stats, originalOrder?: RankEntry[], useMatchScore = false) =>
  (a: RankEntry, b: RankEntry) => {
    // Same player
    if (a === b) return 0;

    if (data) {
      if (
        data[a] &&
        data[b] &&
        "matchRecord" in data[a] &&
        "matchRecord" in data[b]
      ) {
        // MTG rules:
        // 1. Match points (useMatchScore ? matchScore : matchRate)
        let val = useMatchScore
          ? (data[b].matchScore || 0) - (data[a].matchScore || 0)
          : (data[b].matchRate || 0) - (data[a].matchRate || 0);
        if (val) return val;

        // 2. Opponents’ match-win percentage
        val = (data[b].oppMatch || 0) - (data[a].oppMatch || 0);
        if (val) return val;

        // 3. Game-win percentage
        val = (data[b].gameRate || 0) - (data[a].gameRate || 0);
        if (val) return val;

        // 4. Opponents’ game-win percentage
        val = (data[b].oppGame || 0) - (data[a].oppGame || 0);
        if (val) return val;
      }

      // If data exists but only 1 player
      else if (data[b] && "matchRecord" in data[b]) return 1;
      else if (data[a] && "matchRecord" in data[a]) return -1;
    }

    // 5. Original player order
    if (originalOrder) {
      const aIdx = originalOrder.indexOf(a),
        bIdx = originalOrder.indexOf(b);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      else if (bIdx !== -1) return originalOrder.length;
      else if (aIdx !== -1) return -originalOrder.length;
    }

    // Use UUIDs to settle otherwise (Reverse order)
    return a < b ? 1 : -1;
  };

//  HELPERS  //

type RankEntry = Stats["ranking"][number];

/** Add together every element in an array */
const sumArr = (array: number[]) => array.reduce((sum, n) => sum + n, 0);

/** Sum parallel elements of two arrays (NOTE: length of first array will be used) */
const addArrays = (arrays: number[][]) =>
  arrays[0].map((_, i) => arrays.reduce((sum, arr) => sum + arr[i], 0));

/** Get average value of array */
const avgArr = (array: number[], useFloor = false) =>
  array.length ? sumArr(array) / array.length : useFloor ? points.floor : 0;
