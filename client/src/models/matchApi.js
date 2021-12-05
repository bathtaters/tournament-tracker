import { baseApi, tagIds } from './baseApi';

const matchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Mutations
    report: build.mutation({
      query: ({ id, clear = false, ...body }) => ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft'),
    }),
    updateMatch: build.mutation({
      query: ({ id, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft'),
    }),
    swapPlayers: build.mutation({
      query: body => ({ url: `match/swap`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft'),
    }),
    dropPlayer: build.mutation({
      query: ({ draft, player, undrop = false }) => ({ 
        url: `draft/${draft}/${undrop ? 'undrop' : 'drop'}/${player}`, method: 'POST'
      }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft'),
    }),

  }),
});

export const {
  useReportMutation, useUpdateMatchMutation, useSwapPlayersMutation, useDropPlayerMutation,
} = matchApi;