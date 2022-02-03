import { baseApi } from './baseApi';

import getTags from '../services/tags.services';
import { fakeRound, swapToDay, getStatus } from '../services/event.services';
import { nextTempId } from '../services/shared.services';


export const eventApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Queries
    event:   build.query({
      query: (id=null) => `event/${id || 'all'}`,
      transformResponse: (res) => {
        if (res.id) res.status = getStatus(res);
        else Object.keys(res).forEach(id => res[id].status = getStatus(res[id]));
        console.log('EVENT',res);
        return res;
      },
      providesTags: getTags('Event'),
    }),
    stats: build.query({
      query: (eventid) => `event/${eventid || 'all'}/stats`,
      transformResponse: res => console.log('BRKRS',res) || res,
      providesTags: getTags({Stats: (r,i,a)=> (r && r.eventids && r.eventids[0]) || a},{limit:1}),
    }),

    // Mutations
    createEvent: build.mutation({
      query: body => ({ url: `event`, method: 'POST', body }),
      transformResponse: res => console.log('NEW_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(body, { dispatch, getState }) {
        const events = getState().dbApi.queries['event(undefined)'];
        const id = nextTempId('EVENT', events && Object.keys(events));
        dispatch(eventApi.util.updateQueryData('event', undefined, draft => { draft[id] = body; }));
        dispatch(baseApi.util.updateQueryData('schedule', undefined, draft => { 
          if (!draft.none) draft.none = {};
          if (!draft.none.events) draft.none.events = [];
          draft.none.events.push(id);
        }));
      },
    }),
    deleteEvent: build.mutation({
      query: id => ({ url: `event/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(id, { dispatch }) {
        dispatch(baseApi.util.updateQueryData('schedule', undefined, draft => { 
          Object.keys(draft).forEach(day => {
            if (draft[day] && draft[day].events && draft[day].events.includes(id))
              draft[day].events.splice(draft[day].events.indexOf(id),1);
          });
        }));
        dispatch(eventApi.util.updateQueryData('event', undefined, draft => { 
          delete draft[id]; 
        }));
      },
    }),
    updateEvent: build.mutation({
      query: ({ id, ...body }) => ({ url: `event/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail'], all:0}),
      onQueryStarted({ id, ...body }, { dispatch }) {
        dispatch(eventApi.util.updateQueryData('event', undefined, draft => { 
          Object.assign(draft[id], body);
        }));
        dispatch(eventApi.util.updateQueryData('event', id, draft => { 
          Object.assign(draft, body); 
        }));
        if ('day' in body) {
          dispatch(eventApi.util.updateQueryData('schedule', undefined, draft => {
            swapToDay(draft, id, body.day);
          }));
        }
      },
    }),

    nextRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log('ROUND+',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch, getState }) {
        const current = getState().dbApi.queries['event("'+id+'")'].data;
        if (current.status < 2) dispatch(eventApi.util.updateQueryData('stats', id, draft => {
          draft.ranking = current.players;
        }));
        dispatch(eventApi.util.updateQueryData('event', id, draft => { 
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
      query: id => ({ url: `event/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted(id, { dispatch, getState }) {
        const current = getState().dbApi.queries['event("'+id+'")'].data;
        if (current.roundactive === 1) dispatch(eventApi.util.updateQueryData('stats', id, draft => {
          draft.ranking = [];
        }));
        dispatch(eventApi.util.updateQueryData('event', id, draft => { 
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
  useStatsQuery, useEventQuery, 
  useCreateEventMutation, useDeleteEventMutation, useUpdateEventMutation,
  useNextRoundMutation, useClearRoundMutation,
} = eventApi;