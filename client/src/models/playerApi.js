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
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Player'],
    }),
    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log(res) || [res],
      invalidatesTags: ['Player'],
    }),
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Player'],
    }),
  }),
});

export const {
  usePlayerQuery, useCreatePlayerMutation,
  useDeletePlayerMutation, useUpdatePlayerMutation,
} = playerApi;