import { fetchApi, tagTypes, ALL_ID, useSettingsQuery } from '../common/common.fetch';

import { getDays } from '../schedule/services/day.services';

export const headerApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    updateSettings: build.mutation({
      query: (body) => ({ url: 'settings', method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_SETTINGS',res) || res,
      invalidatesTags: ['Settings','Schedule', { type: 'Stats', id: ALL_ID }],
      onQueryStarted(body, { dispatch }) {
        dispatch(fetchApi.util.updateQueryData(
          'settings', undefined, draft => { 
            draft = Object.assign(draft,body);
            draft.dateRange = getDays(draft.datestart, draft.dateend);
          }
        ));
      }
    }),
    
    // DEV ONLY
    resetDb:     build.mutation({
      query: (full=false) => ({ url: 'reset'+(full?'/full':''), method: 'POST' }),
      onQueryStarted(arg, { dispatch, queryFulfilled }) {
        dispatch(fetchApi.util.updateQueryData('schedule', undefined, () => ({})));
        queryFulfilled.then(() => dispatch(fetchApi.util.invalidateTags(tagTypes)));
      },
    }),
  }),
  overrideExisting: true
});

export { fetchApi, tagTypes, useSettingsQuery };
export const { useUpdateSettingsMutation, useResetDbMutation } = headerApi;