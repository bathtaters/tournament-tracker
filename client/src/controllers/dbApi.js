// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import getDays from './getDays';

// Re-used code
const LIST_ID = 'LIST';
const tagIds = type => res => 
  !res ? [{ type, id: LIST_ID }]
  : Array.isArray(res)
  ? [ ...res.map(({ id }) => ({ type, id })), { type, id: LIST_ID } ]
  : [{ type, id: res.id }]

// Base queries for api server
export const dbApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  tagTypes: ['Settings', 'Schedule', 'Draft', 'Player', 'Breakers'],
  endpoints: (build) => ({
    // Fetches
    getAll:      build.query({
      query: () => 'all',
      providesTags: ['Schedule', 'Draft', 'Player', 'Breakers'],
    }),
    getSettings: build.query({
      query: () => 'settings',
      transformResponse: data => {
        if (data.dateRange) data.dateRange = getDays(...data.dateRange);
        return data;
      },
      providesTags: ['Settings'],
    }),
    getSchedule: build.query({
      query: () => 'schedule',
      providesTags: ['Schedule'],
    }),
    getDraft:   build.query({
      query: (id=null) => `draft/${id || 'all'}`,
      providesTags: ['Draft'],
    }),
    getPlayer:  build.query({
      query: (id=null) => `player/${id || 'all'}`,
      providesTags: tagIds('Player'),
    }),
    getBreakers: build.query({
      query: (draftId) => `draft/${draftId}/breakers`,
      providesTags: ['Breakers'],
    }),
    
    // TEST
    testApi:     build.query({ query: () => 'test_backend', }),
    resetDb:     build.mutation({
      query: () => ({ url: 'reset', method: 'GET' }),
      invalidatesTags: ['Settings', 'Schedule', 'Draft', 'Player', 'Breakers'],
    }),

    // Updates - Players
    createPlayer: build.mutation({
      query: ({ name }) => ({ url: `player`, method: 'POST', body: { name }, }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Player'],
    }),
    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log(res) || [res],
      invalidatesTags: ['Player'],
    }),
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Player'],
    }),

    // Updates - Drafts
    createDraft: build.mutation({
      query: body => ({ url: `draft`, method: 'POST', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft','Schedule'],
    }),
    deleteDraft: build.mutation({
      query: id => ({ url: `draft/${id}`, method: 'DELETE' }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft','Schedule'],
    }),
    updateDraft: build.mutation({
      query: ({ id, ...body }) => ({ url: `draft/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft','Schedule'],
    }),
    nextRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft'],
    }),
    clearRound: build.mutation({
      query: id => ({ url: `draft/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft'],
    }),
    dropPlayer: build.mutation({
      query: ({ draft, player, undrop = false }) => ({ 
        url: `draft/${draft}/${undrop ? 'undrop' : 'drop'}/${player}`, method: 'POST'
      }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft'],
    }),
    
    // Updates - Matches
    // TODO - split out match TAGs
    report: build.mutation({
      query: ({ id, clear = false, ...body }) => ({ url: `match/${id}`, method: clear ? 'DELETE' : 'POST', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft'],
    }),
    updateMatch: build.mutation({
      query: ({ id, ...body }) => ({ url: `match/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft'],
    }),
    swapPlayers: build.mutation({
      query: body => ({ url: `match/swap`, method: 'PATCH', body }),
      transformResponse: res => console.log(res) || res,
      invalidatesTags: ['Draft'],
    }),

  }),
})

// Output generated functions
export const { 
  useGetAllQuery, useGetSettingsQuery,
  useGetScheduleQuery, useGetBreakersQuery, 
  useGetDraftQuery, useGetPlayerQuery,

  useCreatePlayerMutation, useDeletePlayerMutation, useUpdatePlayerMutation,
  
  useCreateDraftMutation, useDeleteDraftMutation, useUpdateDraftMutation,
  useNextRoundMutation, useClearRoundMutation, 
  useDropPlayerMutation, useSwapPlayersMutation, 
  useReportMutation, useUpdateMatchMutation,

  useTestApiQuery, useResetDbMutation
 } = dbApi;