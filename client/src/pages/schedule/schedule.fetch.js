import { fetchApi, useEventQuery, useSettingsQuery, usePrefetch } from '../common/common.fetch';
import { scheduleAdapter } from './services/scheduleFetch.services';
import { useSetEventMutation } from '../eventEditor/eventEditor.fetch';

export const scheduleApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    schedule: build.query({
      query: () => 'schedule',
      transformResponse: scheduleAdapter,
      providesTags: ['Schedule'],
    }),
    
  }),
  overrideExisting: true
});

export { useEventQuery, useSettingsQuery, useSetEventMutation, usePrefetch };
export const { useScheduleQuery } = scheduleApi;