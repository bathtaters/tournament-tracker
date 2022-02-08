import { fetchApi } from '../../common/common.fetch';
import { fakeRound } from './event.services';
import { swapPlayerArrays, moveDrops } from './swap.services';

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

export function reportUpdate({ id, eventid, clear = false, ...body }, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('match', eventid, draft => { 
    if (clear) {
      draft[id].reported = false;
      draft[id].drops = [];
    } else 
      Object.assign(draft[id], body, {reported: true});
  }));
};

export function matchUpdate({ id, eventid, clear = false, ...body }, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('match', eventid, draft => { 
    const idx = body.key.match(/^wins\.(\d+)$/);
    if (idx) draft[id].wins[+idx[1]] = body.value;
    else if (body.key === 'draws') draft[id].draws = body.value;
  }));
};

export function swapPlayersUpdate({ id, eventid, clear = false, ...body }, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('match', eventid, draft => { 
    const idx = [...Array(2)].map((_,i) => draft[body.swap[i].id].players.indexOf(body.swap[i].playerid));
    if (idx.every(i => i !== -1)) {
      swapPlayerArrays(draft, body.swap, idx, 'players');
      swapPlayerArrays(draft, body.swap, idx, 'wins');
    }
    moveDrops(draft, body.swap[0].id, body.swap[1].id, body.swap[0].playerid, 'drops');
    moveDrops(draft, body.swap[1].id, body.swap[0].id, body.swap[1].playerid, 'drops');
  }));
};