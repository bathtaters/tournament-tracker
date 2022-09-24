import { fetchApi, getTags, tagTypes, ALL_ID } from '../../core/store/fetchApi';
import { useFetchingStatus, useFetchingProvider, useForceRefetch } from '../../core/services/global.services';
import { getEvent, getSettings } from './services/fetch.services';
import { debugLogging } from '../../assets/config';

export const commonApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    settings: build.query({
      query: () => 'settings',
      transformResponse: getSettings,
      providesTags: ['Settings'],
    }),

    event:   build.query({
      query: (id=null) => `event/${id || 'all'}`,
      transformResponse: getEvent,
      providesTags: getTags('Event'),
    }),

    stats: build.query({
      query: (eventid) => `event/${eventid || 'all'}/stats`,
      transformResponse: debugLogging ? (res) => console.log('BRKRS',res) || res : undefined,
      providesTags: getTags({Stats: (r,i,a)=> (r && r.eventids && r.eventids[0]) || a},{limit:1}),
    }),

    player:  build.query({
      query: (id=null) => `player/${id || 'all'}`,
      transformResponse: debugLogging ? (res) => console.log('PLAYER',res) || res : undefined,
      providesTags: getTags('Player'),
    }),

  }),
  overrideExisting: true
});

export { fetchApi, tagTypes, ALL_ID, getTags, useFetchingStatus, useFetchingProvider, useForceRefetch };
export const { usePlayerQuery, useSettingsQuery, useEventQuery, useStatsQuery, usePrefetch } = commonApi;