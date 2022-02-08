import { fetchApi, getTags, tagTypes, ALL_ID } from '../../core/store/fetchApi';

import getDays from '../schedule/services/schedule.services';
import { getStatus } from '../event/services/event.services';

export const commonApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    settings: build.query({
      query: () => 'settings',
      transformResponse: data => {
        data.dateRange = getDays(data.datestart, data.dateend);
        console.log('SETTINGS',data)
        return data;
      },
      providesTags: ['Settings'],
    }),

    event:   build.query({
      query: (id=null) => `event/${id || 'all'}`,
      transformResponse: (res) => {
        if (res.id) res.status = getStatus(res);
        else Object.keys(res).forEach(id => res[id].status = getStatus(res[id]));
        console.log('EVENT',res);
        return res;
      },
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