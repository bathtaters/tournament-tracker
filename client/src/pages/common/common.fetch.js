import { fetchApi, getTags, tagTypes, ALL_ID } from '../../core/store/fetchApi';
import { useFetchingStatus, useFetchingProvider, useForceRefetch } from '../../core/services/global.services';
import { getEvent, getSettings, getLocalVar } from './services/fetch.services';
import { debugLogging } from '../../assets/config';
import { localKeys } from '../../assets/constants';


export const commonApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    session: build.query({
      query: () => ({ url: '/session', method: 'POST', body: { session: getLocalVar(localKeys.session) } }),
      transformResponse: debugLogging ? (res) => console.log('SESS',res) || res : undefined,
      providesTags: ['Session'],
    }),

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
      providesTags: getTags({ Stats: (res,err,id) => id || 'TOTAL' }, { limit: 1 }),
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
export const { useSessionQuery, usePlayerQuery, useSettingsQuery, useEventQuery, useStatsQuery, usePrefetch } = commonApi;
export const useSessionState = commonApi.endpoints.session.useQueryState;

export const useAccessLevel = () => {
  const { data } = useSessionState();
  return data?.access || 0;
};
