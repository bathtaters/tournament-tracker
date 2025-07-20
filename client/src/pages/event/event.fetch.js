import {
  fetchApi,
  getTags,
  useEventQuery,
  usePlayerQuery,
  useSettingsQuery,
  useStatsQuery,
} from "../common/common.fetch";
import { useMatchQuery } from "../match/match.fetch";
import { useSetEventMutation } from "../eventEditor/eventEditor.fetch";
import {
  nextRoundUpdate,
  clearRoundUpdate,
  clockUpdate,
} from "./services/eventFetch.services";
import { calcClock } from "./services/clock.services";
import { debugLogging } from "../../assets/config";

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    clock: build.query({
      query: (id) => ({ url: `event/${id}/clock`, method: "GET" }),
      transformResponse: calcClock,
      providesTags: getTags("Clock"),
      onQueryStarted: clockUpdate,
    }),

    nextRound: build.mutation({
      query: ({ id, roundactive }) => ({
        url: `event/${id}/round/${roundactive + 1}`,
        method: "POST",
      }),
      transformResponse: debugLogging
        ? (res) => console.log("ROUND+", res) || res
        : undefined,
      invalidatesTags: getTags(
        ["Event", "Match", "Stats", "PlayerMatch", "Clock"],
        { all: 0, addAll: ["Stats"] }
      ),
      onQueryStarted: nextRoundUpdate,
    }),

    clearRound: build.mutation({
      query: ({ id, roundactive }) => ({
        url: `event/${id}/round/${roundactive}`,
        method: "DELETE",
      }),
      transformResponse: debugLogging
        ? (res) => console.log("ROUND-", res) || res
        : undefined,
      invalidatesTags: getTags(
        ["Event", "Match", "Stats", "PlayerMatch", "Clock"],
        { all: 0, addAll: ["Stats"] }
      ),
      onQueryStarted: clearRoundUpdate,
    }),

    updateCredits: build.mutation({
      query: ({ id, undo = false }) => ({
        url: `event/${id}/credits`,
        method: undo ? "DELETE" : "POST",
      }),
      transformResponse: debugLogging
        ? (res) => console.log("UPD_CREDITS", res) || res
        : undefined,
      invalidatesTags: getTags("Player", { addAll: ["Player"] }),
    }),

    clockAction: build.mutation({
      // Actions: run, reset, pause
      query: ({ id, action }) => ({
        url: `event/${id}/clock/${action}`,
        method: "POST",
      }),
      transformResponse: debugLogging
        ? (res) => console.log("CLOCK_OP", res) || res
        : undefined,
      invalidatesTags: getTags("Clock"),
    }),
  }),
  overrideExisting: true,
});
const refetchStats = (id) =>
  fetchApi.util.invalidateTags(getTags("Stats", { all: 0 })({ id }));

export {
  useEventQuery,
  usePlayerQuery,
  useSettingsQuery,
  useStatsQuery,
  useSetEventMutation,
  useMatchQuery,
  refetchStats,
};
export const {
  useNextRoundMutation,
  useClearRoundMutation,
  useUpdateCreditsMutation,
  useClockActionMutation,
  useClockQuery,
} = eventApi;
