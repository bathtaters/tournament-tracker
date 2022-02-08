import { 
  fetchApi, getTags,
  useEventQuery, usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../common/common.fetch';

import { 
  nextRoundUpdate, clearRoundUpdate,
  reportUpdate, matchUpdate, swapPlayersUpdate
} from './services/eventFetch.services'

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    match:   build.query({
      query: eventid => eventid ? `match/event/${eventid}` : 'match/all',
      transformResponse: res => console.log('MATCH',res) || res,
      providesTags: getTags({Match: (r,i,a)=> (r && r.eventid) || a},{limit:1}),
    }),

    nextRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log('ROUND+',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted: nextRoundUpdate,
    }),

    clearRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted: clearRoundUpdate,
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

export { useEventQuery, usePlayerQuery, useSettingsQuery, useStatsQuery };
export const {
  useMatchQuery, useNextRoundMutation, useClearRoundMutation,
  useReportMutation, useUpdateMatchMutation, useSwapPlayersMutation,
} = eventApi;