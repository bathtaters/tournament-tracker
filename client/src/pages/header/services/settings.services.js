import { fetchApi } from '../../common/common.fetch';
import { getDays } from '../../schedule/services/day.services';

// Runs array.filter on nested arrays (Only calls predicate on non-array elements)
export const deepFilter = (array, predicate) => array.reduce((res,elem,idx) => {
  if (Array.isArray(elem)) res.push(deepFilter(elem, predicate))
  else if (predicate(elem,idx,array)) res.push(elem)
  return res
}, [])

// Returns properties from 'base' that are changed from 'compare'
export const getUnqiue = (base, compare = {}) => Object.keys(base).reduce((obj,key) => {
  if (base[key] !== compare[key]) obj[key] = base[key]
  return obj
}, {})

// Cache Update
export function settingsUpdate(body, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData(
    'settings', undefined, draft => { 
      draft = Object.assign(draft,body);
      draft.dateRange = getDays(draft.datestart, draft.dateend);
    }
  ));
}

export const clearSchedule = (_, { dispatch }) => {
  dispatch(fetchApi.util.updateQueryData('schedule', undefined, () => ({})));
}