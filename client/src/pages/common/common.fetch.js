import { fetchApi, getTags, tagTypes, ALL_ID } from '../../core/store/fetchApi';
import { useFetchingStatus, useFetchingProvider, useForceRefetch } from '../../core/services/global.services';
import { getEvent, getSettings } from './services/fetch.services';
import { debugLogging } from '../../assets/config';


export const commonApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    session: build.query({
      query: () => ({ url: '/session/player', method: 'GET' }),
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
  const { data, isLoading, error } = useSessionState();
  return { access: data?.access || 0, isLoading, error };
};

export const useShowRaw = () => {
  const { data, isLoading, isError } = commonApi.endpoints.settings.useQueryState();
  const { access } = useAccessLevel();
  return !isLoading && !isError && access > 2 && data.showrawjson;
};