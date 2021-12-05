import { baseApi, tagIds } from './baseApi';

const draftApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    draft:   build.query({
      query: (id=null) => `draft/${id || 'all'}`,
      providesTags: tagIds('Draft'),
    }),
    breakers: build.query({
      query: (draftId) => `draft/${draftId}/breakers`,
      providesTags: tagIds('Breakers'),
    }),

    // Mutations
    createDraft: build.mutation({
      query: body => ({ url: `draft`, method: 'POST', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft','Schedule'),
    }),
    deleteDraft: build.mutation({
      query: id => ({ url: `draft/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft','Schedule'),
    }),
    updateDraft: build.mutation({
      query: ({ id, ...body }) => ({ url: `draft/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft','Schedule'),
    }),

    nextRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft'),
    }),
    clearRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: tagIds('Draft'),
    }),

    

  }),
});

export const {
  useBreakersQuery, useDraftQuery, 
  useCreateDraftMutation, useDeleteDraftMutation, useUpdateDraftMutation,
  useNextRoundMutation, useClearRoundMutation,
} = draftApi;