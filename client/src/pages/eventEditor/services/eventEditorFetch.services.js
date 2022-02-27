import { fetchApi } from '../../common/common.fetch';
import { nextTempId } from './eventEditor.services';

// Change Date of Event - Helper for eventUpdate
function swapToDay(schedule, id, newDay) {
  // Remove old
  for (const day in schedule) {
    const idx = (schedule[day].events || []).indexOf(id);
    if (idx >= 0) { 
      schedule[day].events.splice(idx,1); break;
    }
  }
  // Add new
  if (!schedule[newDay]) schedule[newDay] = { events: [id] };
  else if (!schedule[newDay].events) schedule[newDay].events = [id];
  else schedule[newDay].events.push(id);
}

// Update cache for new event
function createUpdate(body, { dispatch, getState }) {
  const events = getState().dbApi.queries['event(undefined)'];
  const id = nextTempId('EVENT', events && Object.keys(events));
  dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { draft[id] = body; }));
  dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => { 
    if (!draft.none) draft.none = {};
    if (!draft.none.events) draft.none.events = [];
    draft.none.events.push(id);
  }));
};

// Update cache for existing event
function eventUpdate({ id, ...body }, { dispatch }) {
  console.log('~*UPD_EVENT*~', id, body);
  dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { 
    Object.assign(draft[id], body);
  }));
  dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
    Object.assign(draft, body); 
  }));
  if ('day' in body) {
    dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => {
      swapToDay(draft, id, body.day);
    }));
  }
};

// Remove event from cache
export function deleteUpdate(id, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('schedule', undefined, draft => { 
    for (const day in draft) {
      const idx = draft[day]?.events?.indexOf(id) ?? -1;
      if (idx !== -1) draft[day].events.splice(idx, 1);
    }
  }));
  dispatch(fetchApi.util.updateQueryData('event', undefined, draft => { 
    delete draft[id]; 
  }));
};

// Pick create/update function based on body
export const eventSet = (body, meta) => body.id ? eventUpdate(body, meta) : createUpdate(body, meta);