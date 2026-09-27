import { commonApi, getTags } from "../../common/General/common.fetch";
import {
  clearRoundUpdate,
  clockUpdate,
  nextRoundUpdate,
} from "./services/eventFetch.services";
import { calcClock } from "./services/clock.services";
import { debugLogging } from "../../assets/config";

export {
  useEventQuery,
  usePlayerQuery,
  useSettingsQuery,
  useStatsQuery,
  useTeamQuery,
} from "../../common/General/common.fetch";
export { useMatchQuery } from "../match/match.fetch";
export { useSetEventMutation } from "../eventEditor/eventEditor.fetch";

export const eventApi = commonApi.injectEndpoints({
  endpoints: (build) => ({
    clock: build.query({
      query: (id) => ({ url: `event/${id}/clock`, method: "GET" }),
      transformResponse: calcClock,
      providesTags: getTags(["Clock"]),
      onQueryStarted: clockUpdate,
    }),

    nextRound: build.mutation({
      query: ({ id, roundactive }) => ({
        url: `event/${id}/round/${roundactive + 1}`,
        method: "POST",
      }),
      transformResponse: debugLogging
        ? (res) => {
            console.log("ROUND+", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(
        ["Event", "Match", "Stats", "PlayerMatch", "Clock"],
        { all: false, addAll: ["Stats", "Match"] },
      ),
      onQueryStarted: nextRoundUpdate,
    }),

    clearRound: build.mutation({
      query: ({ id, roundactive }) => ({
        url: `event/${id}/round/${roundactive}`,
        method: "DELETE",
      }),
      transformResponse: debugLogging
        ? (res) => {
            console.log("ROUND-", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(
        ["Event", "Match", "Stats", "PlayerMatch", "Clock"],
        { all: false, addAll: ["Stats"] },
      ),
      onQueryStarted: clearRoundUpdate,
    }),

    updateCredits: build.mutation({
      query: ({ id, undo = false }) => ({
        url: `event/${id}/credits`,
        method: undo ? "DELETE" : "POST",
      }),
      transformResponse: debugLogging
        ? (res) => {
            console.log("UPD_CREDITS", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Player"], { addAll: ["Player"] }),
    }),

    clockAction: build.mutation({
      // Actions: run, reset, pause
      query: ({ id, action }) => ({
        url: `event/${id}/clock/${action}`,
        method: "POST",
      }),
      transformResponse: debugLogging
        ? (res) => {
            console.log("CLOCK_OP", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Clock"]),
    }),
  }),
  overrideExisting: true,
});

export const refetchStats = (id?: string) =>
  commonApi.util.invalidateTags(getTags(["Stats"], { all: false })({ id }));

export const {
  useNextRoundMutation,
  useClearRoundMutation,
  useUpdateCreditsMutation,
  useClockActionMutation,
  useClockQuery,
} = eventApi;
