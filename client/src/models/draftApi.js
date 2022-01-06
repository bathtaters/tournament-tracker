import { baseApi, tagIds } from './baseApi';

import { fakeRound, swapToDay, getStatus } from '../controllers/draftHelpers';
import { nextTempId } from '../controllers/misc';


export const draftApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    draft:   build.query({
      query: (id=null) => `draft/${id || 'all'}`,
      transformResponse: (res) => {
        if (res.id) res.status = getStatus(res);
        else Object.keys(res).forEach(id => res[id].status = getStatus(res[id]));
        console.log('DRAFT',res);
        return res;
      },
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
      onQueryStarted(body, { dispatch, getState }) {
        const drafts = getState().dbApi.queries['draft(undefined)'];
        const id = nextTempId('DRAFT', drafts && Object.keys(drafts));
        dispatch(draftApi.util.updateQueryData('draft', undefined, draft => { draft[id] = body; }));
        dispatch(baseApi.util.updateQueryData('schedule', undefined, draft => { 
          if (!draft.none) draft.none = []; draft.none.push(id);
        }));
      },
    }),
    deleteDraft: build.mutation({
      query: id => ({ url: `draft/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_DRAFT',res) || res,
      invalidatesTags: tagIds('Draft',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(id, { dispatch }) {
        dispatch(baseApi.util.updateQueryData('schedule', undefined, draft => { 
          Object.keys(draft).forEach(day => 
            draft[day] && draft[day].includes(id) && draft[day].splice(draft[day].indexOf(id),1)
          );
        }));
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
      invalidatesTags: tagIds(['Draft','Match'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch }) {
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          if (draft.roundactive > draft.roundcount) return;
          if (!draft.matches) draft.matches = [];
          if (draft.roundactive++ < draft.roundcount)
            draft.matches.push(fakeRound(draft));
        }));
      },
    }),
    clearRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: tagIds(['Draft','Match'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch }) {
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          if (draft.roundactive < 1) return;
          draft.matches.pop();
          draft.roundactive--;
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