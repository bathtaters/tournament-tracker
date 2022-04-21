import { fetchApi } from "../settings.fetch";

// Update cache for settingsUpdate
export function settingsUpdate(body, { dispatch, queryFulfilled }) {
  const update = dispatch(fetchApi.util.updateQueryData(
    'settings', undefined, draft => Object.assign(draft,body)
  ));
  queryFulfilled.catch(update.undo); // rollback
}

// Extra functions during full reset
export async function doReset(resetDb, fullReset, navigate) {
  localStorage.clear()
  navigate('/')
  await resetDb(fullReset)
  window.location.reload(true)
  return true
}