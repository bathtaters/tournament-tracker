import { fetchApi, tagTypes } from "../header.fetch";
import { getDays } from '../../schedule/services/day.services';

// Check if any queries are currently running
export const isAnyLoading = (state) =>
  Object.values(state.dbApi.queries)
    .some(qry => qry.status === 'pending');

// Force refetch of all data
export const forceRefetchConstructor = (dispatch) =>
  () => dispatch(fetchApi.util.invalidateTags(tagTypes));

// Update cache for settingsUpdate
export function settingsUpdate(body, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData(
    'settings', undefined, draft => { 
      draft = Object.assign(draft,body);
      draft.dateRange = getDays(draft.datestart, draft.dateend);
    }
  ));
}

// Update cache when resetting data
export const clearSchedule = (_, { dispatch }) => {
  dispatch(fetchApi.util.updateQueryData('schedule', undefined, () => ({})));
}