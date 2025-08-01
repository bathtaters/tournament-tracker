import { fetchApi } from "../settings.fetch";
import { serializeDates } from "../../schedule/services/date.utils";

// Update cache for settingsUpdate
export function settingsUpdate(body, { dispatch, queryFulfilled }) {
  const serialized = serializeDates(body);
  const update = dispatch(
    fetchApi.util.updateQueryData("settings", undefined, (draft) => ({
      ...draft,
      ...serialized,
    }))
  );
  queryFulfilled.catch(update.undo); // rollback
}

// Extra functions during full reset
export async function doReset(resetDb, fullReset, navigate) {
  localStorage.clear();
  navigate("/");
  await resetDb(fullReset);
  window.location.reload(true);
  return true;
}
