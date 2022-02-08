import { fetchApi, getTags, useEventQuery, usePlayerQuery, useSettingsQuery } from '../common/common.fetch';
import { useCreatePlayerMutation } from '../players/player.fetch'

import { swapToDay } from '../event/services/event.services';
import { nextTempId } from '../../core/services/shared.services';

export const eventEditorApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    createEvent: build.mutation({
      query: body => ({ url: `event`, method: 'POST', body }),
      transformResponse: res => console.log('NEW_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted(body, { dispatch, getState }) {
        const events = getState().dbApi.queries['event(undefined)'];
        const id = nextTempId('EVENT', events && Object.keys(events));
        dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { draft[id] = body; }));
        dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => { 
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
        dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => { 
          Object.keys(draft).forEach(day => {
            if (draft[day] && draft[day].events && draft[day].events.includes(id))
              draft[day].events.splice(draft[day].events.indexOf(id),1);
          });
        }));
        dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { 
          delete draft[id]; 
        }));
      },
    }),

    updateEvent: build.mutation({
      query: ({ id, ...body }) => ({ url: `event/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail'], all:0}),
      onQueryStarted({ id, ...body }, { dispatch }) {
        dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { 
          Object.assign(draft[id], body);
        }));
        dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
          Object.assign(draft, body); 
        }));
        if ('day' in body) {
          dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => {
            swapToDay(draft, id, body.day);
          }));
        }
      },
    }),

  }),
  overrideExisting: true
});

export { useEventQuery, usePlayerQuery, useSettingsQuery, useCreatePlayerMutation };
export const {
  useCreateEventMutation, useDeleteEventMutation, useUpdateEventMutation,
} = eventEditorApi;