import { 
  fetchApi, getTags,
  useEventQuery, usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../shared/shared.fetch';

import { fakeRound } from './services/event.services';
import { swapPlayerArrays, moveDrops } from './services/swap.services';

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
      onQueryStarted(id, { dispatch, getState }) {
        const current = getState().dbApi.queries['event("'+id+'")'].data;
        if (current.status < 2) dispatch(fetchApi.util.updateQueryData('stats', id, draft => {
          draft.ranking = current.players;
        }));
        dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
          if (draft.roundactive > draft.roundcount) return;
          if (!draft.matches) draft.matches = [];
          if (draft.roundactive++ < draft.roundcount)
            draft.matches.push(fakeRound(draft));
          else draft.status = 3;
          if (draft.status < 2) draft.status = 2;
        }));
      },
    }),

    clearRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch, getState }) {
        const current = getState().dbApi.queries['event("'+id+'")'].data;
        if (current.roundactive === 1) dispatch(fetchApi.util.updateQueryData('stats', id, draft => {
          draft.ranking = [];
        }));
        dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
          if (draft.roundactive < 1) return;
          draft.matches.pop();
          draft.roundactive = draft.matches.length;
          if (!draft.roundactive) draft.status = 1;
          else if (draft.status === 3) draft.status = 2;
        }));
      },
    }),

    report: build.mutation({
      query: ({ id, eventid, clear = false, ...body }) =>
        ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log('REPORT',res) || res,
      invalidatesTags: getTags(['Match','Event','Stats'],{key:'eventid',addBase:['PlayerDetail'],all:0}),
      onQueryStarted({ id, eventid, clear = false, ...body }, { dispatch, queryFulfilled }) {
        dispatch(fetchApi.util.updateQueryData('match', eventid, draft => { 
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
        dispatch(fetchApi.util.updateQueryData('match', eventid, draft => { 
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
        dispatch(fetchApi.util.updateQueryData('match', eventid, draft => { 
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

export { useEventQuery, usePlayerQuery, useSettingsQuery, useStatsQuery };
export const {
  useMatchQuery, useNextRoundMutation, useClearRoundMutation,
  useReportMutation, useUpdateMatchMutation, useSwapPlayersMutation,
} = eventApi;