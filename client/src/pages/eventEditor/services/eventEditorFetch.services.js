import { fetchApi } from '../../common/common.fetch';
import { updateSchedule } from '../../schedule/services/scheduleFetch.services';
import { nextTempId } from "../../common/services/basic.services";

// Update cache for new event
function createUpdate(body, { dispatch, getState, queryFulfilled }) {
  const events = getState().dbApi.queries['event(undefined)'];
  const id = nextTempId('EVENT', events && Object.keys(events));
  const updateEvent = dispatch(fetchApi.util.updateQueryData('event', undefined, draft => {
    draft[id] = body;
  }));
  const updateSched = dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => { 
    updateSchedule(draft, id, body);
  }));
  queryFulfilled.catch(() => { updateEvent.undo(); updateSched.undo(); }); // rollback
};

// Update cache for existing event
function eventUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
  const updateAll = dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { 
    Object.assign(draft[id], body);
  }));
  const updateOne = dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
    Object.assign(draft, body); 
  }));

  const updateSched = 'day' in body || 'slot' in body ?
    dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => {
      updateSchedule(draft, id, body);
    })) : null;

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo(); updateSched?.undo() }); // rollback
};

// Remove event from cache
export function deleteUpdate(id, { dispatch, queryFulfilled }) {
  const updateSched = dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => { 
    for (const day in draft) {
      const idx = draft[day]?.events?.indexOf(id) ?? -1;
      if (idx !== -1) draft[day].events.splice(idx, 1);
    }
  }));
  const updateEvent = dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { 
    delete draft[id]; 
  }));
  queryFulfilled.catch(() => { updateEvent.undo(); updateSched.undo(); }); // rollback
};

// Pick create/update function based on body
export const eventSet = (body, meta) => body.id ? eventUpdate(body, meta) : createUpdate(body, meta);