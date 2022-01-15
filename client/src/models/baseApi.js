// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import getDays from '../controllers/getDays';
import { tagTypes } from '../services/getTags';


// Base queries for api server
export const baseApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  tagTypes,
  endpoints: (build) => ({
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

    // Updates
    updateSettings: build.mutation({
      query: (body) => ({ url: 'settings', method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_SETTINGS',res) || res,
      invalidatesTags: ['Settings','Schedule'],
      onQueryStarted(body, { dispatch }) {
        dispatch(baseApi.util.updateQueryData(
          'settings', undefined, draft => { 
            draft = Object.assign(draft,body);
            draft.dateRange = getDays(draft.datestart, draft.dateend);
          }
        ));
      }
    }),
    
    // TEST
    testApi:     build.query({ query: () => 'test_backend', }),
    resetDb:     build.mutation({
      query: (full=false) => ({ url: 'reset'+(full?'/full':''), method: 'POST' }),
      onQueryStarted(arg, { dispatch, queryFulfilled }) {
        dispatch(baseApi.util.updateQueryData('schedule', undefined, () => ({})));
        queryFulfilled.then(() => dispatch(baseApi.util.invalidateTags(tagTypes)));
      },
    }),

  }),
})

// Output generated functions
export const {
  useSettingsQuery, useUpdateSettingsMutation,
  useScheduleQuery, usePrefetch,
  useTestApiQuery, useResetDbMutation
 } = baseApi;