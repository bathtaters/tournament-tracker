import { fetchApi, useEventQuery } from '../common/common.fetch';
import { usePrefetchEvent } from '../common/common.hooks';
import { getMatchData } from "./services/playerEventFetch.services";
import { debugLogging } from '../../assets/config';


export const playerEventsApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    playerEvents:  build.query({
      query: (id) => `player/${id}/events`,
      transformResponse: debugLogging ? res => console.log('PLAYER_EVENTS',res) || res : undefined,
      providesTags: ['PlayerDetail'],
    }),

    playerMatches:  build.query({
      query: (id) => `player/${id}/matches`,
      transformResponse: !debugLogging ? (res, _, id) => getMatchData(res, id) :
        (res, _, id) => console.log('PLAYER_MATCHES',res) || getMatchData(res,id),
      providesTags: ['PlayerDetail'],
    }),
    
  }),
  overrideExisting: true
});

export { useEventQuery, usePrefetchEvent };
export const { usePlayerEventsQuery, usePlayerMatchesQuery } = playerEventsApi;