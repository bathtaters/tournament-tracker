import { baseApi, tagIds } from './baseApi';

const matchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    match:   build.query({
      query: draftId => `match/all/draft/${draftId}`,
      providesTags: tagIds({Match: (r,i,a)=> (r && r.draftid) || a},{limit:1}),
    }),

    // Mutations
    report: build.mutation({
      query: ({ id, draftId, clear = false, ...body }) =>
        ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds(['Match','Draft','Breakers'],{key:'draftId'}),
      onQueryStarted({ id, draftId, clear = false, ...body }, { dispatch, queryFulfilled }) {
        dispatch(matchApi.util.updateQueryData('match', draftId, draft => { 
          if (clear) {
            draft[id].reported = false;
            draft[id].drops = [];
          } else 
            Object.assign(draft[id], body, {reported: true});
        }));
      },
    }),
    updateMatch: build.mutation({
      query: ({ id, draftId, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds(['Match','Draft','Breakers'],{key:'draftId'}),
      onQueryStarted({ id, draftId, clear = false, ...body }, { dispatch }) {
        dispatch(matchApi.util.updateQueryData('match', draftId, draft => { 
          if ('draws' in body) draft[id].draws = body.draws;
          if ('players' in body) Object.assign(draft[id].players, body.players);
        }));
      },
    }),
    swapPlayers: build.mutation({
      query: ({ draftId, ...body}) => ({ url: `match/util/swap`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Match',{key:'draftId'}),
      onQueryStarted({ id, draftId, clear = false, ...body }, { dispatch }) {
        dispatch(matchApi.util.updateQueryData('match', draftId, draft => { 
          draft[body.playerA.id].players[body.playerB.playerId] = draft[body.playerA.id].players[body.playerA.playerId];
          draft[body.playerB.id].players[body.playerA.playerId] = draft[body.playerB.id].players[body.playerB.playerId];
          delete draft[body.playerA.id].players[body.playerA.playerId];
          delete draft[body.playerB.id].players[body.playerB.playerId];
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