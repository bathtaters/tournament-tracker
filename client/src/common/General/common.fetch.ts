import type { EventData, Player, Settings, Stats } from "types/models";
import type { OverloadQuery } from "types/helpers";
import {
  ALL_ID,
  fetchApi,
  getTags,
  tagTypes,
  useFetchingStatus,
} from "../../core/store/fetchApi";
import { useForceRefetch } from "../../core/services/global.services";
import { getEvent, getSettings } from "./services/fetch.services";
import { debugLogging } from "../../assets/config";

export const commonApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    session: build.query<Player, void>({
      query: () => ({ url: "/session/player", method: "GET" }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("SESS", res);
            return res;
          }
        : undefined,
      providesTags: ["Session"],
    }),

    settings: build.query<Settings, void>({
      query: () => "settings",
      transformResponse: getSettings,
      providesTags: ["Settings"],
    }),

    event: build.query<
      EventData | Record<EventData["id"], EventData>,
      EventData["id"] | null
    >({
      query: (id = null) => `event/${id ?? "all"}`,
      transformResponse: getEvent,
      providesTags: getTags(["Event"]),
    }),

    stats: build.query<Stats, EventData["id"] | null>({
      query: (eventid) => `event/${eventid ?? "all"}/stats`,
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("BREAKERS", res);
            return res;
          }
        : undefined,
      providesTags: getTags(
        { Stats: (res, err, id) => id || "TOTAL" },
        { limit: 1 },
      ),
    }),

    player: build.query<
      Player | Record<Player["id"], Player>,
      Player["id"] | null
    >({
      query: (id = null) => `player/${id ?? "all"}`,
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("PLAYER", res);
            return res;
          }
        : undefined,
      providesTags: getTags(["Player"]),
    }),
  }),
  overrideExisting: true,
});

export { tagTypes, ALL_ID, getTags, useFetchingStatus, useForceRefetch };

// Export Query functions (Apply overloads to queries with multiple return types)
export const { useSessionQuery, useSettingsQuery, useStatsQuery } = commonApi;
export const usePlayerQuery: OverloadQuery<
  Player,
  Player["id"],
  typeof commonApi.usePlayerQuery
> = commonApi.usePlayerQuery;
export const useEventQuery: OverloadQuery<
  EventData,
  EventData["id"],
  typeof commonApi.useEventQuery
> = commonApi.useEventQuery;

export const useSessionState = commonApi.endpoints.session.useQueryState;
export const useAccessLevel = () => {
  const { data, isLoading, error } = useSessionState();
  return { access: data?.access ?? 0, isLoading, error };
};

export const useShowRaw = () => {
  const { data, isLoading, isError } =
    commonApi.endpoints.settings.useQueryState();
  const { access } = useAccessLevel();
  return !isLoading && !isError && access > 2 && data.showrawjson;
};
