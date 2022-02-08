import { fetchApi, getTags, useEventQuery, usePlayerQuery, useSettingsQuery } from '../common/common.fetch';
import { createUpdate, deleteUpdate, eventUpdate } from './services/eventEditorFetch.services'
import { useCreatePlayerMutation } from '../players/player.fetch'

export const eventEditorApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    createEvent: build.mutation({
      query: body => ({ url: `event`, method: 'POST', body }),
      transformResponse: res => console.log('NEW_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted: createUpdate,
    }),

    deleteEvent: build.mutation({
      query: id => ({ url: `event/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log('DEL_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail']}),
      onQueryStarted: deleteUpdate,
    }),

    updateEvent: build.mutation({
      query: ({ id, ...body }) => ({ url: `event/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_EVENT',res) || res,
      invalidatesTags: getTags('Event',{addBase:['Schedule','PlayerDetail'], all:0}),
      onQueryStarted: eventUpdate,
    }),

  }),
  overrideExisting: true
});

export { useEventQuery, usePlayerQuery, useSettingsQuery, useCreatePlayerMutation };
export const {
  useCreateEventMutation, useDeleteEventMutation, useUpdateEventMutation,
} = eventEditorApi;