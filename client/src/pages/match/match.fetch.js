import { 
  fetchApi, getTags,
  usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../common/common.fetch';

import { reportUpdate, matchUpdate, swapPlayersUpdate } from './services/matchFetch.services'

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    match:   build.query({
      query: eventid => eventid ? `match/event/${eventid}` : 'match/all',
      transformResponse: res => console.log('MATCH',res) || res,
      providesTags: getTags({Match: (r,i,a)=> (r && r.eventid) || a},{limit:1}),
    }),

    report: build.mutation({
      query: ({ id, eventid, clear = false, ...body }) =>
        ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log('REPORT',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: reportUpdate,
    }),

    updateMatch: build.mutation({
      query: ({ id, eventid, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_MATCH',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: matchUpdate,
    }),

    swapPlayers: build.mutation({
      query: ({ eventid, ...body}) => ({ url: `match/swap`, method: 'POST', body }),
      transformResponse: res => console.log('SWAP',res) || res,
      invalidatesTags: getTags('Match',{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: swapPlayersUpdate,
    }),

  }),
  overrideExisting: true
});

export { usePlayerQuery, useSettingsQuery, useStatsQuery };
export const {
  useMatchQuery, useUpdateMatchMutation, 
  useReportMutation, useSwapPlayersMutation,
} = eventApi;