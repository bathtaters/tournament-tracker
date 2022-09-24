import { 
  fetchApi, getTags,
  usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../common/common.fetch';
import { debugLogging } from '../../assets/config';

import { reportUpdate, dropsUpdate, matchUpdate, swapPlayersUpdate } from './services/matchFetch.services'

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    match:   build.query({
      query: eventid => eventid ? `match/event/${eventid}` : 'match/all',
      transformResponse: debugLogging ? res => console.log('MATCH',res) || res : undefined,
      providesTags: getTags({Match: (r,i,a)=> (r && r.eventid) || a},{limit:1}),
    }),

    report: build.mutation({
      query: ({ id, eventid, clear = false, ...body }) =>
        ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: debugLogging ? res => console.log('REPORT',res) || res : undefined,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: reportUpdate,
    }),

    updateMatch: build.mutation({
      query: ({ id, eventid, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: debugLogging ? res => console.log('UPD_MATCH',res) || res : undefined,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: matchUpdate,
    }),

    updateDrops: build.mutation({
      query: ({ id, playerid, eventid, ...body }) => ({ url: `match/${id}/drop`, method: 'PATCH', body: { ...body, id: playerid } }),
      transformResponse: debugLogging ? res => console.log('UPD_DROPS',res) || res : undefined,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: dropsUpdate,
    }),

    swapPlayers: build.mutation({
      query: ({ eventid, ...body}) => ({ url: `match/swap`, method: 'POST', body }),
      transformResponse: debugLogging ? res => console.log('SWAP',res) || res : undefined,
      invalidatesTags: getTags(['Event','Match'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted: swapPlayersUpdate,
    }),

  }),
  overrideExisting: true
});

export { usePlayerQuery, useSettingsQuery, useStatsQuery };
export const {
  useMatchQuery, useUpdateMatchMutation, 
  useReportMutation, useUpdateDropsMutation,
  useSwapPlayersMutation,
} = eventApi;