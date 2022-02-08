import { fetchApi } from '../../common/common.fetch';

// Cache update
export function playerUpdate({ id, ...body }, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { 
    Object.assign(draft[id], body); 
  }));
  dispatch(fetchApi.util.updateQueryData('player', id, draft => { 
    Object.assign(draft, body); 
  }));
};