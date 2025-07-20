import { fetchApi } from '../../common/common.fetch';
import { updateSchedule } from '../../schedule/services/scheduleFetch.services';
import { nextTempId } from "../../common/services/basic.services";

// Update cache for new event
function createUpdate(body, { dispatch, getState, queryFulfilled }) {
  const events = getState().dbApi.queries['event(undefined)'];
  const id = nextTempId('EVENT', events && Object.keys(events));
  const updateEvent = dispatch(fetchApi.util.updateQueryData(
    'event', undefined,
    (draft) => ({  ...draft, [id]: { ...body }})
  ));
  const updateSched = dispatch(fetchApi.util.updateQueryData(
    'schedule', undefined,
    (draft) => updateSchedule(draft, id, body)
  ));

  queryFulfilled.catch(() => { updateEvent.undo(); updateSched.undo(); }); // rollback
};

// Update cache for existing event
function eventUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
  const updateAll = dispatch(fetchApi.util.updateQueryData(
    'event', undefined,
    (draft) => ({  ...draft, [id]: { ...draft[id], ...body }})
  ));
  const updateOne = dispatch(fetchApi.util.updateQueryData(
    'event', id,
    (draft) => ({ ...draft, ...body })
  ));
  const updateSched = 'day' in body || 'slot' in body ?
    dispatch(fetchApi.util.updateQueryData(
      'schedule', undefined,
      (draft) => updateSchedule(draft, id, body)
    )) : null;

  queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo(); updateSched?.undo() }); // rollback
};

// Remove event from cache
export function deleteUpdate(id, { dispatch, queryFulfilled }) {
  const updateSched = dispatch(fetchApi.util.updateQueryData(
    'schedule', undefined,
    (draft) => updateSchedule(draft, id)
  ));
  const updateEvent = dispatch(fetchApi.util.updateQueryData(
    'event', undefined,
    (draft) => Object.fromEntries(Object.entries(draft).filter(([ key ]) => key !== id))
  ));

  queryFulfilled.catch(() => { updateEvent.undo(); updateSched.undo(); }); // rollback
};

// Pick create/update function based on body
export const eventSet = (body, meta) => body.id ? eventUpdate(body, meta) : createUpdate(body, meta);