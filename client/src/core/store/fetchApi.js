// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import getDays from '../../pages/schedule/services/schedule.services';
import getTags, { tagTypes, ALL_ID } from '../services/tags.services';

const apiVersion = 'v0';

// Base queries for api server
export const fetchApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/${apiVersion}/` }),
  tagTypes,
  endpoints: (build) => ({
    testApi:     build.query({ query: () => 'meta', }),

    // Fetches
    settings: build.query({
      query: () => 'settings',
      transformResponse: data => {
        data.dateRange = getDays(data.datestart, data.dateend);
        console.log('SETTINGS',data)
        return data;
      },
      providesTags: ['Settings'],
    }),
    schedule: build.query({
      query: () => 'schedule',
      transformResponse: res => console.log('SCHEDULE',res) || res,
      providesTags: ['Schedule'],
    }),

  }),
})

// Output generated functions
export const {
  useSettingsQuery, useUpdateSettingsMutation,
  useScheduleQuery, usePrefetch,
  useTestApiQuery, useResetDbMutation
 } = fetchApi;

 export { getTags, tagTypes, ALL_ID };