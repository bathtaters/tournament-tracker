import { fetchApi, useEventQuery, useSettingsQuery, usePrefetch } from '../common/common.fetch';
import { useSetEventMutation } from '../eventEditor/eventEditor.fetch';

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

export { useEventQuery, useSettingsQuery, useSetEventMutation, usePrefetch };
export const { useScheduleQuery } = scheduleApi;