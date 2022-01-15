import { baseApi, tagIds } from './baseApi';
import { draftApi } from './draftApi';
import { nextTempId } from '../controllers/misc';
import { getStatus } from '../controllers/draftHelpers';


export const playerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Query
    player:  build.query({
      query: (id=null) => `player/${id || 'all'}`,
      transformResponse: res => console.log('PLAYER',res) || res,
      providesTags: tagIds('Player'),
    }),
    playerDrafts:  build.query({
      query: (id) => `player/${id}/drafts`,
      transformResponse: res => {
        res.forEach((d,i) => res[i].status = getStatus(d));
        console.log('PLAYER_DET',res);
        return res;
      },
      providesTags: tagIds('PlayerDetail',{ all: false }),
    }),

    // Mutations
    createPlayer: build.mutation({
      query: (body) => ({ url: `player`, method: 'POST', body, }),
      transformResponse: res => console.log('ADD_PLAYER',res) || res,
      invalidatesTags: tagIds('Player', { addAll:['Breakers'] }),
      onQueryStarted(body, { dispatch, getState }) {
        const breakers = getState().dbApi.queries['breakers(undefined)'];
        const id = nextTempId('PLAYER', breakers && breakers.data && breakers.data.ranking);
        dispatch(playerApi.util.updateQueryData('player', undefined, draft => { draft[id] = body; }));
        dispatch(draftApi.util.updateQueryData('breakers', undefined, draft => { draft.ranking.push(id); }));
      },
    }),
    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_PLAYER',res) || res,
      invalidatesTags: tagIds('Player', { addAll:['Breakers'] }),
      onQueryStarted(id, { dispatch }) {
        dispatch(playerApi.util.updateQueryData('player', undefined, draft => { delete draft[id]; }));
        dispatch(draftApi.util.updateQueryData('breakers', undefined, draft => {
          const idx = draft.ranking ? draft.ranking.indexOf(id) : -1;
          if (idx > -1) draft.ranking.splice(idx,1);
          delete draft[id];
        }));
      },
    }),
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_PLAYER',res) || res,
      invalidatesTags: tagIds('Player',{all:0}),
      onQueryStarted({ id, ...body }, { dispatch }) {
        dispatch(playerApi.util.updateQueryData('player', undefined, draft => { 
          Object.assign(draft[id], body); 
        }));
        dispatch(playerApi.util.updateQueryData('player', id, draft => { 
          Object.assign(draft, body); 
        }));
      },
    }),
  }),
  overrideExisting: true
});

export const {
  usePlayerQuery, usePlayerDraftsQuery, useCreatePlayerMutation,
  useDeletePlayerMutation, useUpdatePlayerMutation,
} = playerApi;