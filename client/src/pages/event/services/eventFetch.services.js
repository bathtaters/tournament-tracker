import { fetchApi, setFetch } from '../../common/common.fetch';
import { fakeRound } from './event.services';

export function nextRoundUpdate(id, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
    if (draft.roundactive > draft.roundcount) return; // Handle error
    if (!draft.matches) draft.matches = []; // Handle no matches
    if (draft.status < 2) draft.status = 2; // Handle initial round

    // Add next round
    if (draft.roundactive++ < draft.roundcount)
      draft.matches.push(fakeRound(draft));
    
    // End draft + cancel update
    else draft.status = 3;
  }));
}

export function clearRoundUpdate(id, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('event', id, draft => { 
    if (draft.roundactive < 1) return; // Handle error

    // Remove round
    draft.matches.pop();
    draft.roundactive = draft.matches.length;

    // Fix status on start/end event
    if (!draft.roundactive) draft.status = 1;
    else if (draft.status === 3) draft.status = 2;
  }));
};