import { fetchApi } from '../../common/common.fetch';
import { nextTempId } from './player.services';

export function playerUpdate({ id, ...body }, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { 
    Object.assign(draft[id], body); 
  }));
  dispatch(fetchApi.util.updateQueryData('player', id, draft => { 
    Object.assign(draft, body); 
  }));
};

export function createUpdate(body, { dispatch, getState }) {
  const stats = getState().dbApi.queries['stats(undefined)'];
  const id = nextTempId('PLAYER', stats && stats.data && stats.data.ranking);
  dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { draft[id] = body; }));
  dispatch(fetchApi.util.updateQueryData('stats', undefined, draft => { draft.ranking.push(id); }));
};

export function deleteUpdate(id, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { delete draft[id]; }));
  dispatch(fetchApi.util.updateQueryData('stats', undefined, draft => {
    const idx = draft.ranking ? draft.ranking.indexOf(id) : -1;
    if (idx > -1) draft.ranking.splice(idx,1);
    delete draft[id];
  }));
};