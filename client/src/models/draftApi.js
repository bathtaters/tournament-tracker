import { baseApi, tagIds } from './baseApi';

import { fakeRound, swapToDay } from '../controllers/draftHelpers';


export const draftApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    draft:   build.query({
      query: (id=null) => `draft/${id || 'all'}`,
      transformResponse: res => console.log('DRAFT',res) || res,
      providesTags: tagIds('Draft'),
    }),
    breakers: build.query({
      query: (draftId) => `draft/${draftId || 'all'}/breakers`,
      transformResponse: res => console.log('BRKRS',res) || res,
      providesTags: tagIds('Breakers'),
    }),

    // Mutations
    createDraft: build.mutation({
      query: body => ({ url: `draft`, method: 'POST', body }),
      transformResponse: res => console.log('NEW_DRAFT',res) || res,
      invalidatesTags: tagIds('Draft',{addBase:['Schedule','PlayerDetail']}),
    }),
    deleteDraft: build.mutation({
      query: id => ({ url: `draft/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_DRAFT',res) || res,
      invalidatesTags: tagIds('Draft',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(id, { dispatch }) {
        dispatch(draftApi.util.updateQueryData('draft', undefined, draft => { 
          delete draft[id]; 
        }));
      },
    }),
    updateDraft: build.mutation({
      query: ({ id, ...body }) => ({ url: `draft/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_DRAFT',res) || res,
      invalidatesTags: tagIds('Draft',{addBase:['Schedule','PlayerDetail'], all:0}),
      onQueryStarted({ id, ...body }, { dispatch }) {
        dispatch(draftApi.util.updateQueryData('draft', undefined, draft => { 
          Object.assign(draft[id], body);
        }));
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          Object.assign(draft, body); 
        }));
        if ('day' in body) {
          dispatch(draftApi.util.updateQueryData('schedule', undefined, draft => {
            swapToDay(draft, id, body.day);
          }));
        }
      },
    }),

    nextRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log('ROUND+',res) || res,
      invalidatesTags: tagIds(['Draft','Match'], {all:0}),
      onQueryStarted(id, { dispatch }) {
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          if (!draft.matches) draft.matches = [];
          draft.matches.push(fakeRound(draft));
          draft.roundactive++;
        }));
      },
    }),
    clearRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: tagIds(['Draft','Match'], {all:0}),
      onQueryStarted(id, { dispatch }) {
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          draft.roundactive--;
          draft.matches.pop();
        }));
      },
    }),

  }),
  overrideExisting: true
});

export const {
  useBreakersQuery, useDraftQuery, 
  useCreateDraftMutation, useDeleteDraftMutation, useUpdateDraftMutation,
  useNextRoundMutation, useClearRoundMutation,
} = draftApi;