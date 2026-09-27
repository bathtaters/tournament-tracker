import { commonApi, getTags } from "../../common/General/common.fetch";
import { getMatchData } from "./services/playerEventFetch.services";
import { debugLogging } from "../../assets/config";

export const playerEventsApi = commonApi.injectEndpoints({
  endpoints: (build) => ({
    playerEvents: build.query({
      query: (id) => `player/${id}/events`,
      transformResponse: debugLogging
        ? (res) => {
            console.log("PLAYER_EVENTS", res);
            return res;
          }
        : undefined,
      providesTags: getTags({ PlayerEvent: null }),
    }),

    playerMatches: build.query({
      query: (id) => `player/${id}/matches`,
      transformResponse: !debugLogging
        ? (res, _, id) => getMatchData(res, id)
        : (res, _, id) => {
            console.log("PLAYER_MATCHES", res);
            return getMatchData(res, id);
          },
      providesTags: getTags({ PlayerMatch: null }),
    }),
  }),
  overrideExisting: true,
});

export const { usePlayerEventsQuery, usePlayerMatchesQuery } = playerEventsApi;

export {
  useEventQuery,
  usePlayerQuery,
  useTeamQuery,
} from "../../common/General/common.fetch";
export { usePrefetchEvent } from "../../common/General/common.hooks";
