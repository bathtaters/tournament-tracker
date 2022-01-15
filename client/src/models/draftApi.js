import { baseApi } from './baseApi';

import getTags from '../services/getTags';
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
      providesTags: getTags('Draft'),
    }),
    breakers: build.query({
      query: (draftId) => `draft/${draftId || 'all'}/breakers`,
      transformResponse: res => console.log('BRKRS',res) || res,
      providesTags: getTags({Breakers: (r,i,a)=> (r && r.draftIds && r.draftIds[0]) || a},{limit:1}),
    }),

    // Mutations
    createDraft: build.mutation({
      query: body => ({ url: `draft`, method: 'POST', body }),
      transformResponse: res => console.log('NEW_DRAFT',res) || res,
      invalidatesTags: getTags('Draft',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(body, { dispatch, getState }) {
        const drafts = getState().dbApi.queries['draft(undefined)'];
        const id = nextTempId('DRAFT', drafts && Object.keys(drafts));
        dispatch(draftApi.util.updateQueryData('draft', undefined, draft => { draft[id] = body; }));
        dispatch(baseApi.util.updateQueryData('schedule', undefined, draft => { 
          if (!draft.none) draft.none = {};
          if (!draft.none.drafts) draft.none.drafts = [];
          draft.none.drafts.push(id);
        }));
      },
    }),
    deleteDraft: build.mutation({
      query: id => ({ url: `draft/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_DRAFT',res) || res,
      invalidatesTags: getTags('Draft',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(id, { dispatch }) {
        dispatch(baseApi.util.updateQueryData('schedule', undefined, draft => { 
          Object.keys(draft).forEach(day => {
            if (draft[day] && draft[day].drafts && draft[day].drafts.includes(id))
              draft[day].drafts.splice(draft[day].drafts.indexOf(id),1);
          });
        }));
        dispatch(draftApi.util.updateQueryData('draft', undefined, draft => { 
          delete draft[id]; 
        }));
      },
    }),
    updateDraft: build.mutation({
      query: ({ id, ...body }) => ({ url: `draft/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_DRAFT',res) || res,
      invalidatesTags: getTags('Draft',{addBase:['Schedule','PlayerDetail'], all:0}),
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
      invalidatesTags: getTags(['Draft','Match','Breakers'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch, getState }) {
        const current = getState().dbApi.queries['draft("'+id+'")'].data;
        if (current.status < 2) dispatch(draftApi.util.updateQueryData('breakers', id, draft => {
          draft.ranking = current.players;
        }));
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          if (draft.roundactive > draft.roundcount) return;
          if (!draft.matches) draft.matches = [];
          if (draft.roundactive++ < draft.roundcount)
            draft.matches.push(fakeRound(draft));
          else draft.status = 3;
          if (draft.status < 2) draft.status = 2;
        }));
      },
    }),
    clearRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: getTags(['Draft','Match','Breakers'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch, getState }) {
        const current = getState().dbApi.queries['draft("'+id+'")'].data;
        if (current.roundactive === 1) dispatch(draftApi.util.updateQueryData('breakers', id, draft => {
          draft.ranking = [];
        }));
        dispatch(draftApi.util.updateQueryData('draft', id, draft => { 
          if (draft.roundactive < 1) return;
          draft.matches.pop();
          draft.roundactive = draft.matches.length;
          if (!draft.roundactive) draft.status = 1;
          else if (draft.status === 3) draft.status = 2;
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