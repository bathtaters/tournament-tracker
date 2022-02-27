import { fetchApi, getTags, useEventQuery, usePlayerQuery, useSettingsQuery } from '../common/common.fetch';
import { deleteUpdate, eventSet } from './services/eventEditorFetch.services'
import { useCreatePlayerMutation } from '../players/player.fetch'

export const eventEditorApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    setEvent: build.mutation({
      query: ({ id, ...body }) => id ?
        ({ url: `event/${id}`, method: 'PATCH', body }) :
        ({ url: `event`,       method: 'POST',  body }),
      transformResponse: res => console.log('SET_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted: eventSet,
    }),

    deleteEvent: build.mutation({
      query: id => ({ url: `event/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted: deleteUpdate,
    }),

  }),
  overrideExisting: true
});

export { useEventQuery, usePlayerQuery, useSettingsQuery, useCreatePlayerMutation };
export const {
  useSetEventMutation, useDeleteEventMutation,
} = eventEditorApi;