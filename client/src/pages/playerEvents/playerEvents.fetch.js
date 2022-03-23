import { fetchApi, useEventQuery } from '../common/common.fetch';
import { usePrefetchEvent } from '../common/common.hooks';
import { getMatchData } from "./services/playerEventFetch.services";


export const playerEventsApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    playerEvents:  build.query({
      query: (id) => `player/${id}/events`,
      transformResponse: res => console.log('PLAYER_EVENTS',res) || res,
      providesTags: ['PlayerDetail'],
    }),

    playerMatches:  build.query({
      query: (id) => `player/${id}/matches`,
      transformResponse: (res, _, id) => console.log('PLAYER_MATCHES',res) || getMatchData(res,id),
      providesTags: ['PlayerDetail'],
    }),
    
  }),
  overrideExisting: true
});

export { useEventQuery, usePrefetchEvent };
export const { usePlayerEventsQuery, usePlayerMatchesQuery } = playerEventsApi;