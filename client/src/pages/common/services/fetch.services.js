import { getDays } from '../../schedule/services/day.services';
import { getStatus } from '../../event/services/event.services';

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