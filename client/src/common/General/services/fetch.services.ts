import type { Dispatch } from "@reduxjs/toolkit";
import type { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import type { EventData, Settings } from "types/models";
import { fetchApi } from "../../../core/store/fetchApi";
import { debugLogging, settings } from "../../../assets/config";
import { getBaseData } from "../../../core/services/validation.services";

export const defaultSettings = getBaseData("settings").defaults;

// Handle local data
export const getLocalVar = <K extends keyof Settings>(key: K) =>
  JSON.parse(
    localStorage.getItem(`${settings.localPrefix}-${key}`),
  ) as Settings[K];
export const setLocalVar = <K extends keyof Settings>(
  key: K,
  value: Settings[K],
  dispatch: Dispatch<any>,
) => {
  localStorage.setItem(`${settings.localPrefix}-${key}`, JSON.stringify(value));
  // if dispatch passed, update state as well
  if (dispatch)
    dispatch(
      fetchApi.util.updateQueryData(
        "settings" as any,
        undefined,
        (draft: Settings) => {
          draft[key] = value;
        },
      ),
    );
};

export const getLocalSettings = () =>
  settings.storeLocal.reduce((data, key) => {
    const value = getLocalVar(key);
    if (value !== null) (data as any)[key] = value;
    return data;
  }, {} as Partial<Settings>);

// Combine default + server + local settings
export function getSettings(server: Partial<Settings>) {
  if (!server) server = {};
  const local = getLocalSettings();
  debugLogging && console.log("SETTINGS", { server, local });
  if (!("planslots" in server)) server.planslots = server.dayslots;
  if (!server.plandates) server.plandates = [server.datestart, server.dateend];
  return {
    ...defaultSettings,
    ...server,
    ...local,
    saved: Object.keys(server),
  } as Settings & { saved: (keyof Settings)[] };
}

/**
 * Get the current state of an event
 * @param event - Event data object (Can be undefined)
 * @returns - 0 = N/A, 1 = Pre-Event, 2 = Active, 3 = Complete
 */
const getStatus = (event?: EventData) =>
  !event
    ? 0
    : !event.roundactive
      ? 1
      : event.roundactive > event.roundcount
        ? 3
        : 2;

export const getEvent = (
  res: EventData | Record<EventData["id"], EventData>,
  meta: FetchBaseQueryMeta,
  arg: EventData["id"] | null,
) => {
  if (meta.response?.status === 204) {
    debugLogging && console.warn(`EVENT <${arg}> does not exist`);
    return undefined;
  }

  if ("id" in res) {
    res.status = getStatus(res as EventData);
  } else {
    Object.keys(res).forEach((id) => {
      res[id].status = getStatus(res[id]);
    });
  }
  debugLogging && console.log("EVENT", res);
  return res;
};
