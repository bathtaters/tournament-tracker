import { fetchApi } from '../../common/common.fetch';
import { fakeRound } from './event.services';

export function nextRoundUpdate(id, { dispatch, getState }) {
  const current = getState().dbApi.queries['event("'+id+'")'].data;
  if (current.status < 2) dispatch(fetchApi.util.updateQueryData('stats', id, draft => {
    draft.ranking = current.players;
  }));
  dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
    if (draft.roundactive > draft.roundcount) return;
    if (!draft.matches) draft.matches = [];
    if (draft.roundactive++ < draft.roundcount)
      draft.matches.push(fakeRound(draft));
    else draft.status = 3;
    if (draft.status < 2) draft.status = 2;
  }));
}

export function clearRoundUpdate(id, { dispatch, getState }) {
  const current = getState().dbApi.queries['event("'+id+'")'].data;
  if (current.roundactive === 1) dispatch(fetchApi.util.updateQueryData('stats', id, draft => {
    draft.ranking = [];
  }));
  dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
    if (draft.roundactive < 1) return;
    draft.matches.pop();
    draft.roundactive = draft.matches.length;
    if (!draft.roundactive) draft.status = 1;
    else if (draft.status === 3) draft.status = 2;
  }));
};