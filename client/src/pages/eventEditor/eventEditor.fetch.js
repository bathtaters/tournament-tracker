import { fetchApi, getTags, useEventQuery, usePlayerQuery, useSettingsQuery } from '../common/common.fetch';
import { deleteUpdate, eventSet } from './services/eventEditorFetch.services'
import { useCreatePlayerMutation } from '../players/player.fetch'
import { debugLogging } from '../../assets/config';

export const eventEditorApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    setEvent: build.mutation({
      query: ({ id, ...body }) => id ?
        ({ url: `event/${id}`, method: 'PATCH', body }) :
        ({ url: `event`,       method: 'POST',  body }),
      transformResponse: debugLogging ? res => console.log('SET_EVENT',res) || res : undefined,
      invalidatesTags: getTags(['Event','PlayerEvent'],{addBase:['Schedule',{type:'Stats',id:'TOTAL'}]}),
      onQueryStarted: eventSet,
    }),

    deleteEvent: build.mutation({
      query: id => ({ url: `event/${id}`, method: 'DELETE' }),
      transformResponse: debugLogging ? res => console.log('DEL_EVENT',res) || res : undefined,
      invalidatesTags: getTags(['Event','PlayerEvent'],{addBase:['Schedule',{type:'Stats',id:'TOTAL'}]}),
      onQueryStarted: deleteUpdate,
    }),

  }),
  overrideExisting: true
});

export { useEventQuery, usePlayerQuery, useSettingsQuery, useCreatePlayerMutation };
export const {
  useSetEventMutation, useDeleteEventMutation,
} = eventEditorApi;