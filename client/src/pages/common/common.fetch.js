import { fetchApi, getTags, tagTypes, ALL_ID } from '../../core/store/fetchApi';
import { getSettings, getEvent } from './services/fetch.services';

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
      transformResponse: res => console.log('BRKRS',res) || res,
      providesTags: getTags({Stats: (r,i,a)=> (r && r.eventids && r.eventids[0]) || a},{limit:1}),
    }),

    player:  build.query({
      query: (id=null) => `player/${id || 'all'}`,
      transformResponse: res => console.log('PLAYER',res) || res,
      providesTags: getTags('Player'),
    }),

  }),
  overrideExisting: true
});

export { fetchApi, tagTypes, ALL_ID, getTags };
export const {
  usePlayerQuery, useSettingsQuery, useEventQuery, useStatsQuery, usePrefetch,
} = commonApi;