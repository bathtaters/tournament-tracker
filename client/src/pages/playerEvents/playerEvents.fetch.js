import {
  fetchApi, getTags, usePrefetch, useEventQuery
} from '../common/common.fetch';


export const playerEventsApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    playerEvents:  build.query({
      query: (id) => `player/${id}/events`,
      transformResponse: res => console.log('PLAYER_EVENTS',res) || res,
      providesTags: getTags('PlayerDetail',{ all: false }),
    }),
    
  }),
  overrideExisting: true
});

export { useEventQuery, usePrefetch };
export const { usePlayerEventsQuery } = playerEventsApi;