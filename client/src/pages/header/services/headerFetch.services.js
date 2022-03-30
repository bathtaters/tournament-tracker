import { fetchApi } from "../header.fetch";

// Update cache for settingsUpdate
export function settingsUpdate(body, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData(
    'settings', undefined, draft => Object.assign(draft,body)
  ));
}

// Extra functions during full reset
export async function doReset(resetDb, fullReset, navigate) {
  localStorage.clear()
  navigate('/')
  await resetDb(fullReset)
  window.location.reload(true)
  return true
}