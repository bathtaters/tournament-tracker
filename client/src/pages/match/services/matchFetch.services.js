import { fetchApi } from '../../common/common.fetch';
import { swapPlayerArrays, moveDrops } from './swap.services';

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
    moveDrops(draft, body.swap[0].id, body.swap[1].id, body.swap[0].playerid);
    moveDrops(draft, body.swap[1].id, body.swap[0].id, body.swap[1].playerid);
  }));
};