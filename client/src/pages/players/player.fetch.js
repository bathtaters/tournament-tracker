import { fetchApi, getTags, usePlayerQuery, useSettingsQuery } from '../shared/shared.fetch';

import { nextTempId } from '../../core/services/shared.services';

export const playerApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_PLAYER',res) || res,
      invalidatesTags: getTags('Player',{all:0}),
      onQueryStarted({ id, ...body }, { dispatch }) {
        dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { 
          Object.assign(draft[id], body); 
        }));
        dispatch(fetchApi.util.updateQueryData('player', id, draft => { 
          Object.assign(draft, body); 
        }));
      },
    }),

    createPlayer: build.mutation({
      query: (body) => ({ url: `player`, method: 'POST', body, }),
      transformResponse: res => console.log('ADD_PLAYER',res) || res,
      invalidatesTags: getTags('Player', { addAll:['Stats'] }),
      onQueryStarted(body, { dispatch, getState }) {
        const stats = getState().dbApi.queries['stats(undefined)'];
        const id = nextTempId('PLAYER', stats && stats.data && stats.data.ranking);
        dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { draft[id] = body; }));
        dispatch(fetchApi.util.updateQueryData('stats', undefined, draft => { draft.ranking.push(id); }));
      },
    }),

    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_PLAYER',res) || res,
      invalidatesTags: getTags('Player', { addAll:['Stats'] }),
      onQueryStarted(id, { dispatch }) {
        dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { delete draft[id]; }));
        dispatch(fetchApi.util.updateQueryData('stats', undefined, draft => {
          const idx = draft.ranking ? draft.ranking.indexOf(id) : -1;
          if (idx > -1) draft.ranking.splice(idx,1);
          delete draft[id];
        }));
      },
    }),
    
  }),
  overrideExisting: true
});

export { usePlayerQuery, useSettingsQuery };
export const { useCreatePlayerMutation, useDeletePlayerMutation } = playerApi;