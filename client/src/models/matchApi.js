import { baseApi } from './baseApi';
import { swapPlayerArrays, moveDrops } from '../services/playerSwappers';
import getTags from '../services/getTags';


export const matchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    match:   build.query({
      query: eventId => eventId ? `match/event/${eventId}` : 'match/all',
      transformResponse: res => console.log('MATCH',res) || res,
      providesTags: getTags({Match: (r,i,a)=> (r && r.eventid) || a},{limit:1}),
    }),

    // Mutations
    report: build.mutation({
      query: ({ id, eventId, clear = false, ...body }) =>
        ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log('REPORT',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventId',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventId, clear = false, ...body }, { dispatch, queryFulfilled }) {
        dispatch(matchApi.util.updateQueryData('match', eventId, draft => { 
          if (clear) {
            draft[id].reported = false;
            draft[id].drops = [];
          } else 
            Object.assign(draft[id], body, {reported: true});
        }));
      },
    }),
    updateMatch: build.mutation({
      query: ({ id, eventId, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_MATCH',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventId',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventId, clear = false, ...body }, { dispatch }) {
        dispatch(matchApi.util.updateQueryData('match', eventId, draft => { 
          const idx = body.key.match(/^wins\.(\d+)$/);
          if (idx) draft[id].wins[+idx[1]] = body.value;
          else if (body.key === 'draws') draft[id].draws = body.value;
        }));
      },
    }),
    swapPlayers: build.mutation({
      query: ({ eventId, ...body}) => ({ url: `match/swap`, method: 'POST', body }),
      transformResponse: res => console.log('SWAP',res) || res,
      invalidatesTags: getTags('Match',{key:'eventId',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventId, clear = false, ...body }, { dispatch }) {
        dispatch(matchApi.util.updateQueryData('match', eventId, draft => { 
          const idx = [...Array(2)].map((_,i) => draft[body.swap[i].id].players.indexOf(body.swap[i].playerId));
          if (idx.every(i => i !== -1)) {
            swapPlayerArrays(draft, body.swap, idx, 'players');
            swapPlayerArrays(draft, body.swap, idx, 'wins');
          }
          moveDrops(draft, body.swap[0].id, body.swap[1].id, body.swap[0].playerId, 'drops');
          moveDrops(draft, body.swap[1].id, body.swap[0].id, body.swap[1].playerId, 'drops');
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