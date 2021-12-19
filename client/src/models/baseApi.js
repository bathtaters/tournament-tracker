// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import getDays from '../controllers/getDays';

export const tagTypes = ['Settings', 'Schedule', 'Draft', 'Match', 'Player', 'PlayerDetail', 'Breakers'];

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
      invalidatesTags: ['Settings'],
      onQueryStarted(body, { dispatch }) {
        dispatch(baseApi.util.updateQueryData(
          'settings', undefined, draft => Object.assign(draft,body)
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
  useScheduleQuery,
  useTestApiQuery, useResetDbMutation
 } = baseApi;




 


 // Tag builder code
const ALL_ID = 'LIST', DEF_KEY = 'id';
export function tagIds(types, { key=null, all=true, addBase=[], addAll=[], limit=0 } = {}) {
  // Normalize 'types' input
  if (typeof types !== 'object') types = types ? {[types]: key} : {};
  else if (Array.isArray(types)) types = types.reduce((obj,t) => {obj[t] = key; return obj;},{});
  // Build tag base
  if (all) addAll = (addAll || []).concat(Object.keys(types));
  const baseTags = (addBase || []).concat(addAll.map(type => ({ type, id: ALL_ID })));
  // Create 'getId' function
  const getId = (type, r, a, k=null) => typeof types[type] === 'function' ? types[type](r,k,a) : r && r[types[type] || DEF_KEY];

  // Return callback for [provides|invalidates]Tags
  return (res,err,arg) => {
    if (err) console.error('Query error on '+JSON.stringify(types)+':'+JSON.stringify(arg), err);

    let tags = [...baseTags], i;
    if (Array.isArray(res)) {
      for (const type in types) {
        i = 0;
        for (const r of res) {
          if (limit && ++i > limit) break;
          const id = getId(type, r, arg, i);
          if (id) tags.push({ type, id });
        }
      }
    } else if (typeof res === 'object') {
      for (const type in types) {
        if (typeof types[type] !== 'function' && res[types[type] || DEF_KEY]) {
          tags.push({ type, id: res[types[type] || DEF_KEY] });
          continue;
        }
        i = 0;
        for (const r in res) {
          if (limit && ++i > limit) break;
          const id = types[type] ? getId(type, res[r], arg, r) : r;
          if (id) tags.push({ type, id });
        }
      }
    } else {
      for (const type in types) {
        if (typeof types[type] === 'function') {
          const id = getId(type, res, arg);
          if (id) tags.push({ type, id });
        }
      }
    }
    return tags;
  };
}