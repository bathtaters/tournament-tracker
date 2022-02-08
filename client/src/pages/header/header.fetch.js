import { fetchApi, tagTypes, ALL_ID, useSettingsQuery } from '../common/common.fetch';
import { settingsUpdate, clearSchedule } from './services/settings.services';

export const headerApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    updateSettings: build.mutation({
      query: (body) => ({ url: 'settings', method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_SETTINGS',res) || res,
      invalidatesTags: ['Settings','Schedule', { type: 'Stats', id: ALL_ID }],
      onQueryStarted: settingsUpdate,
    }),
    
    // DEV ONLY
    resetDb:     build.mutation({
      query: (full=false) => ({ url: 'reset'+(full?'/full':''), method: 'POST' }),
      invalidatesTags: tagTypes,
      onQueryStarted: clearSchedule,
    }),
  }),
  overrideExisting: true
});

export { fetchApi, tagTypes, useSettingsQuery };
export const { useUpdateSettingsMutation, useResetDbMutation } = headerApi;