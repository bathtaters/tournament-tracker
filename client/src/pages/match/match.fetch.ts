import type { MatchData, MatchReport } from "types/models";
import type {
  SwapPlayerBody,
  UpdateDropBody,
  UpdateMatchBody,
} from "types/api";
import {
  commonApi,
  getTags,
  usePlayerQuery,
  useSettingsQuery,
  useStatsQuery,
} from "../../common/General/common.fetch";
import {
  dropsUpdate,
  matchUpdate,
  reportUpdate,
  swapPlayersUpdate,
} from "./services/matchFetch.services";
import { debugLogging } from "../../assets/config";

export const eventApi = commonApi.injectEndpoints({
  endpoints: (build) => ({
    match: build.query<
      Record<MatchData["id"], MatchData>,
      MatchData["eventid"] | null
    >({
      query: (eventid) => (eventid ? `match/event/${eventid}` : "match/all"),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("MATCH", res);
            return res;
          }
        : undefined,
      providesTags: getTags(
        { Match: (r, _, a) => (r && r.eventid) || a },
        { limit: 1 },
      ),
    }),

    report: build.mutation<any, MatchReport>({
      query: ({ id, eventid, clear = false, ...body }) => ({
        url: `match/${id}`,
        method: clear ? "DELETE" : "POST",
        body,
      }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("REPORT", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Match", "Event", "Stats"], {
        key: "eventid",
        all: false,
      }),
      onQueryStarted: reportUpdate,
    }),

    updateMatch: build.mutation<any, UpdateMatchBody>({
      query: ({ id, eventid, ...body }) => ({
        url: `match/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("UPD_MATCH", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Match", "Event", "Stats"], {
        key: "eventid",
        all: false,
      }),
      onQueryStarted: matchUpdate,
    }),

    updateDrops: build.mutation<any, UpdateDropBody>({
      query: ({ id, playerid, eventid, ...body }) => ({
        url: `match/${id}/drop`,
        method: "PATCH",
        body: { ...body, playerid },
      }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("UPD_DROPS", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Match", "Event", "Stats"], {
        key: "eventid",
        all: false,
      }),
      onQueryStarted: dropsUpdate,
    }),

    swapPlayers: build.mutation<any, SwapPlayerBody>({
      query: ({ eventid, ...body }) => ({
        url: `match/swap`,
        method: "POST",
        body,
      }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("SWAP", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Event", "Match"], {
        key: "eventid",
        all: false,
      }),
      onQueryStarted: swapPlayersUpdate,
    }),
  }),
  overrideExisting: true,
});

export { usePlayerQuery, useSettingsQuery, useStatsQuery };
export const {
  useMatchQuery,
  useUpdateMatchMutation,
  useReportMutation,
  useUpdateDropsMutation,
  useSwapPlayersMutation,
} = eventApi;
