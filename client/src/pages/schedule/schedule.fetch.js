import { fetchApi, useEventQuery, useSettingsQuery, usePrefetch } from '../shared/shared.fetch';
import { useUpdateEventMutation } from '../eventEditor/eventEditor.fetch';

export const scheduleApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    schedule: build.query({
      query: () => 'schedule',
      transformResponse: res => console.log('SCHEDULE',res) || res,
      providesTags: ['Schedule'],
    }),
  }),
  overrideExisting: true
});

export { useEventQuery, useSettingsQuery, useUpdateEventMutation, usePrefetch };
export const { useScheduleQuery } = scheduleApi;