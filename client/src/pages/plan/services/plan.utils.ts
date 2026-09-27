import type { EventData } from "types/models";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  commonApi,
  useEventQuery,
  useSessionState,
} from "../../../common/General/common.fetch";
import {
  usePlanStatusQuery,
  useSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateVoterMutation,
  useVoterQuery,
} from "../voter.fetch";
import { toDateObj } from "../../schedule/services/date.utils";
import { plan as config } from "../../../assets/config";

export function usePollStatus(currentStatus?: number, pollStatus?: boolean) {
  const dispatch = useDispatch();
  const { data = {}, refetch } = usePlanStatusQuery(undefined, {
    skip: typeof currentStatus !== "number",
    pollingInterval: pollStatus ? config.statusPoll : undefined,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Keep error around for preset time
  const flashError = useRef<{ message?: string; timer?: NodeJS.Timeout }>({});
  useEffect(() => {
    if (data.error) {
      if (flashError.current.timer) clearTimeout(flashError.current.timer);
      flashError.current = {
        message: data.error,
        timer: setTimeout(() => (flashError.current = {}), config.errorClear),
      };
    }
  }, [data.error]);

  // Force refetches when status changes
  useEffect(() => {
    if (
      typeof currentStatus === "number" &&
      typeof data.planstatus === "number" &&
      data.planstatus !== currentStatus
    ) {
      dispatch(
        commonApi.util.invalidateTags([
          "Settings",
          "Schedule",
          "Voter",
          "Event",
        ]),
      );
      refetch();
    }
  }, [currentStatus, data.planstatus, dispatch, refetch]);

  return { ...data, error: flashError.current.message, refetch };
}

export function usePlanSettings(pollStatus = false) {
  const { data: session, isLoading: sLoad, error: sErr } = useSessionState();
  const {
    data: voters,
    isLoading: aLoad,
    error: aErr,
  } = useVoterQuery(undefined, {
    skip: !session?.access || session.access < 2,
  });
  const {
    data: voter,
    isLoading: vLoad,
    error: vErr,
  } = useVoterQuery(session?.id, { skip: !session?.id });
  const { data: events, isLoading: eLoad, error: eErr } = useEventQuery();
  const { data: settings, isLoading: tLoad, error: tErr } = useSettingsQuery();

  const [updateSettings] = useUpdateSettingsMutation();
  const [updateVoter] = useUpdateVoterMutation();

  const { planprogress, error: flashError } = usePollStatus(
    settings?.planstatus,
    pollStatus,
  );

  const setStatus = useCallback(
    (planstatus: number) => () => updateSettings({ planstatus }),
    [updateSettings],
  );

  const setDays = useCallback(
    (days: string[]) => updateVoter({ id: voter?.id, days }),
    [voter?.id, updateVoter],
  );
  const setEvents = useCallback(
    (events: EventData["id"][]) => updateVoter({ id: voter?.id, events }),
    [voter?.id, updateVoter],
  );

  return {
    access: session?.access,
    settings,
    setStatus,
    updateSettings,

    voter,
    voters,
    updateVoter,
    setDays: voter?.id && setDays,

    events,
    setEvents: voter?.id && setEvents,

    progress: planprogress,
    isLoading: sLoad || aLoad || vLoad || eLoad || tLoad,
    error: sErr || aErr || vErr || eErr || tErr,
    flashError,
  };
}

// Get plan events from all events
export const getPlanned = (events: Record<EventData["id"], EventData>) =>
  indexedKeys(events, ({ plan }: EventData) => Boolean(plan), "plan");

// DATE UTILITIES \\

export const datePickerToArr = (
  { datestart, dateend }: { datestart?: string; dateend?: string } = {},
  { startDate, endDate }: { startDate?: Date; endDate?: Date } = {},
) => [
  startDate?.toISOString().slice(0, 10) || datestart,
  endDate?.toISOString().slice(0, 10) || dateend,
];

export const serverDatesToArr = (
  { datestart, dateend }: { datestart?: string; dateend?: string } = {},
  dateArr: string[] = [],
) => [dateArr[0] || datestart, dateArr[1] || dateend];

export const dateArrToPicker = (dates: string[]) => ({
  startDate: dates[0] ? toDateObj(dates[0]) : null,
  endDate: dates[1] ? toDateObj(dates[1]) : null,
});

export function dateRangeList(dateStart: string, dateEnd: string) {
  if (!dateStart || !dateEnd) return [];

  let arr = [];
  let date = new Date(dateStart);
  const end = new Date(dateEnd);

  while (date <= end) {
    arr.push(date.toISOString().slice(0, 10));
    date.setDate(date.getDate() + 1);
  }
  return arr;
}
export const useDateRangeList = ([dateStart, dateEnd]: string[]) =>
  useMemo(() => dateRangeList(dateStart, dateEnd), [dateStart, dateEnd]);

export const formatDate = (date: string, incYear?: boolean) =>
  date &&
  new Date(date).toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: incYear ? "numeric" : undefined,
  });

function isNextDay(dateA: string, dateB: string) {
  if (!dateA) return true;

  let aDate = new Date(dateA);
  let bDate = new Date(dateB).getDate();

  aDate.setDate(aDate.getDate() + 1);
  return aDate.getDate() === bDate;
}

export function dateListToRange(dates: string[]) {
  let ranges: string[][] = [],
    currRange: string[] = [];

  if (dates)
    dates.forEach((date) => {
      if (isNextDay(currRange[currRange.length - 1], date))
        return (currRange[currRange.length ? 1 : 0] = date);

      ranges.push(currRange.map((d) => formatDate(d)));
      currRange = [date];
    });

  if (currRange.length) ranges.push(currRange.map((d) => formatDate(d)));
  return ranges;
}

// ARRAY UTILITIES \\

/** Add value to array if it's not there, or remove it if it is */
export const addOrRemove = (value: string, array: string[]) =>
  array.includes(value) ? array.filter((v) => v !== value) : [...array, value];

/** Pad out array to padLength using padVal */
export const arrayPad = (
  array: string[],
  padLength: number,
  padVal: string = null,
) =>
  padLength < array.length
    ? array
    : [...array, ...Array(padLength).fill(padVal).slice(array.length)];

export const trimFalsy = (array: string[], start = 0) => {
  let i = array.length;
  while (!array[--i]) {
    if (i <= start) return [];
  }
  return array.slice(start, i + 1);
};

export const arrRemove = (array: string[], idx: number) =>
  trimFalsy(arrInsert(array, idx));

export const arrInsert = (array: string[], idx: number, value?: string) =>
  idx <= array.length
    ? [...array.slice(0, idx), value, ...trimFalsy(array, idx + 1)]
    : [...arrayPad(array, idx), value];

export const arrShift = (array: string[], idx: number, backward = false) =>
  backward
    ? trimFalsy([
        ...array.slice(0, idx - 1),
        array[idx],
        array[idx - 1],
        ...array.slice(idx + 1),
      ])
    : [
        ...array.slice(0, idx),
        array[idx + 1],
        array[idx],
        ...array.slice(idx + 2),
      ];

export const arrSwap = (arr: string[], idx: number[]) => {
  if (idx.length !== 2 || idx[0] === idx[1]) return arr;

  idx.sort((a, b) => a - b);
  if (idx[1] > arr.length) arr = arrayPad(arr, idx[1]);

  return trimFalsy([
    ...arr.slice(0, idx[0]),
    arr[idx[1]],
    ...arr.slice(idx[0] + 1, idx[1]),
    arr[idx[0]],
    ...arr.slice(idx[1] + 1),
  ]);
};

/**
 * Orders an object's keys by a property of the objects,
 * filtering and returning an array of keys.
 *  - Assumes 1-indexing
 *  - Any duplicate indexes or indexes < 0 will be appended to the end in any order
 *  - Any non-numeric or 0 value indexes will be ignored
 * @param filter - Ignores rows where this returns FALSE
 * @param idxKey - Key of the index value (i.e. 'valKey', default: 'idx')
 */
export const indexedKeys = <T extends Record<string, any>>(
  obj: Record<string, T>,
  filter?: (value: T, key: string) => boolean,
  idxKey: string = "idx",
): string[] => {
  const sorted: string[] = [],
    unsorted: string[] = [];
  if (!obj) return sorted;

  for (const key in obj) {
    if (filter && !filter(obj[key], key)) continue;

    const idx = obj[key][idxKey];
    if (typeof idx !== "number" || idx === 0) continue;
    if (idx < 0 || idx - 1 in sorted) {
      unsorted.push(key);
    } else {
      sorted[idx - 1] = key;
    }
  }
  return sorted.filter(Boolean).concat(unsorted);
};
