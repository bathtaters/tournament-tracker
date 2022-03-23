import { fetchApi } from "../header.fetch";

// Update cache for settingsUpdate
export function settingsUpdate(body, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData(
    'settings', undefined, draft => Object.assign(draft,body)
  ));
}

// Update cache when resetting data
export const clearSchedule = (_, { dispatch }) => {
  dispatch(fetchApi.util.updateQueryData('schedule', undefined, () => ({})));
}