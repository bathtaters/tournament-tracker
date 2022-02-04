import { baseApi } from '../schedule/baseApi';
import getTags from '../../core/services/tags.services';

import { swapPlayerArrays, moveDrops } from './services/swap.services';


export const matchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    match:   build.query({
      query: eventid => eventid ? `match/event/${eventid}` : 'match/all',
      transformResponse: res => console.log('MATCH',res) || res,
      providesTags: getTags({Match: (r,i,a)=> (r && r.eventid) || a},{limit:1}),
    }),

    // Mutations
    report: build.mutation({
      query: ({ id, eventid, clear = false, ...body }) =>
        ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log('REPORT',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventid, clear = false, ...body }, { dispatch, queryFulfilled }) {
        dispatch(matchApi.util.updateQueryData('match', eventid, draft => { 
          if (clear) {
            draft[id].reported = false;
            draft[id].drops = [];
          } else 
            Object.assign(draft[id], body, {reported: true});
        }));
      },
    }),
    updateMatch: build.mutation({
      query: ({ id, eventid, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_MATCH',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventid, clear = false, ...body }, { dispatch }) {
        dispatch(matchApi.util.updateQueryData('match', eventid, draft => { 
          const idx = body.key.match(/^wins\.(\d+)$/);
          if (idx) draft[id].wins[+idx[1]] = body.value;
          else if (body.key === 'draws') draft[id].draws = body.value;
        }));
      },
    }),
    swapPlayers: build.mutation({
      query: ({ eventid, ...body}) => ({ url: `match/swap`, method: 'POST', body }),
      transformResponse: res => console.log('SWAP',res) || res,
      invalidatesTags: getTags('Match',{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventid, clear = false, ...body }, { dispatch }) {
        dispatch(matchApi.util.updateQueryData('match', eventid, draft => { 
          const idx = [...Array(2)].map((_,i) => draft[body.swap[i].id].players.indexOf(body.swap[i].playerid));
          if (idx.every(i => i !== -1)) {
            swapPlayerArrays(draft, body.swap, idx, 'players');
            swapPlayerArrays(draft, body.swap, idx, 'wins');
          }
          moveDrops(draft, body.swap[0].id, body.swap[1].id, body.swap[0].playerid, 'drops');
          moveDrops(draft, body.swap[1].id, body.swap[0].id, body.swap[1].playerid, 'drops');
        }));
      },
    }),

  }),
  overrideExisting: true
});

export const {
  useMatchQuery,
  useReportMutation, useUpdateMatchMutation, useSwapPlayersMutation,
} = matchApi;