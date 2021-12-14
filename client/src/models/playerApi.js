import { baseApi } from './baseApi';

const playerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Query
    player:  build.query({
      query: (id=null) => `player/${id || 'all'}`,
      providesTags: ['Player'],
    }),

    // Mutations
    createPlayer: build.mutation({
      query: ({ name }) => ({ url: `player`, method: 'POST', body: { name }, }),
      invalidatesTags: ['Player'],
    }),
    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Player'],
      onQueryStarted(id, { dispatch }) {
        dispatch(playerApi.util.updateQueryData('player', undefined, draft => { delete draft[id]; }));
      },
    }),
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Player'],
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
});

export const {
  usePlayerQuery, useCreatePlayerMutation,
  useDeletePlayerMutation, useUpdatePlayerMutation,
} = playerApi;