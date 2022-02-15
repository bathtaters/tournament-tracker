import { getDays } from '../../schedule/services/date.services';

// Event status
// [0: N/A, 1: Pre-Event, 2: Active, 3: Complete]
const getStatus = event => 
  !event ? 0 : !event.roundactive ? 1 : 
  event.roundactive > event.roundcount ? 3 : 2;

export const getSettings = (data) => {
  data.dateRange = getDays(data.datestart, data.dateend);
  console.log('SETTINGS',data)
  return data;
};

export const getEvent = (res) => {
  if (res.id) res.status = getStatus(res);
  else Object.keys(res).forEach(id => res[id].status = getStatus(res[id]));
  console.log('EVENT',res);
  return res;
};