// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import getDays from '../controllers/getDays';

// Tag builder code
const ALL_ID = 'LIST';
export const tagIds = (type, additional=[]) => res => (
  Array.isArray(res)
  ? [ ...res.map(({ id }) => ({ type, id })), { type, id: ALL_ID } ]
  : res && res.id ? [{ type, id: res.id }] : [{ type, id: ALL_ID }]
).concat(additional);

// Base queries for api server
export const baseApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  tagTypes: ['Settings', 'Schedule', 'Draft', 'Player', 'Breakers'],
  endpoints: (build) => ({
    // Fetches
    settings: build.query({
      query: () => 'settings',
      transformResponse: data => {
        if (data.dateRange) data.dateRange = getDays(...data.dateRange);
        return data;
      },
      providesTags: ['Settings'],
    }),
    schedule: build.query({
      query: () => 'schedule',
      providesTags: ['Schedule'],
    }),
    
    // TEST
    testApi:     build.query({ query: () => 'test_backend', }),
    resetDb:     build.mutation({
      query: () => ({ url: 'reset', method: 'GET' }),
      invalidatesTags: ['Settings', 'Schedule', 'Draft', 'Player', 'Breakers'],
    }),

  }),
})

// Output generated functions
export const {
  useSettingsQuery, useScheduleQuery,
  useTestApiQuery, useResetDbMutation
 } = baseApi;