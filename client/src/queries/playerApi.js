import { baseApi } from './baseApi';
import { eventApi } from './eventApi';

import getTags from '../services/tags.services';
import { nextTempId } from '../services/shared.services';


export const playerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Query
    player:  build.query({
      query: (id=null) => `player/${id || 'all'}`,
      transformResponse: res => console.log('PLAYER',res) || res,
      providesTags: getTags('Player'),
    }),
    playerEvents:  build.query({
      query: (id) => `player/${id}/events`,
      transformResponse: res => console.log('PLAYER_EVENTS',res) || res,
      providesTags: getTags('PlayerDetail',{ all: false }),
    }),

    // Mutations
    createPlayer: build.mutation({
      query: (body) => ({ url: `player`, method: 'POST', body, }),
      transformResponse: res => console.log('ADD_PLAYER',res) || res,
      invalidatesTags: getTags('Player', { addAll:['Stats'] }),
      onQueryStarted(body, { dispatch, getState }) {
        const stats = getState().dbApi.queries['stats(undefined)'];
        const id = nextTempId('PLAYER', stats && stats.data && stats.data.ranking);
        dispatch(playerApi.util.updateQueryData('player', undefined, draft => { draft[id] = body; }));
        dispatch(eventApi.util.updateQueryData('stats', undefined, draft => { draft.ranking.push(id); }));
      },
    }),
    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_PLAYER',res) || res,
      invalidatesTags: getTags('Player', { addAll:['Stats'] }),
      onQueryStarted(id, { dispatch }) {
        dispatch(playerApi.util.updateQueryData('player', undefined, draft => { delete draft[id]; }));
        dispatch(eventApi.util.updateQueryData('stats', undefined, draft => {
          const idx = draft.ranking ? draft.ranking.indexOf(id) : -1;
          if (idx > -1) draft.ranking.splice(idx,1);
          delete draft[id];
        }));
      },
    }),
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_PLAYER',res) || res,
      invalidatesTags: getTags('Player',{all:0}),
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
  usePlayerQuery, usePlayerEventsQuery, useCreatePlayerMutation,
  useDeletePlayerMutation, useUpdatePlayerMutation,
} = playerApi;