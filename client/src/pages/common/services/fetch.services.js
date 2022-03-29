import { fetchApi } from "../common.fetch"
import valid from "../../../assets/validation.json"
import { settings } from "../../../assets/config"

// Handle local data
export const getLocalVar = (key) => JSON.parse(localStorage.getItem(key))
export const setLocalVar = (key, value, dispatch) => {
  localStorage.setItem(key, JSON.stringify(value))
  // if dispatch passed, update state as well
  if (dispatch) dispatch(fetchApi.util.updateQueryData('settings', undefined, (draft) => { draft[key] = value }))
}

export const getLocalSettings = () => settings.storeLocal.reduce((data, key) => {
  const value = getLocalVar(key)
  if (value !== null) data[key] = value
  return data
}, {})

// Combine default + server + local settings
export function getSettings(server) {
  if (!server) server = {}
  const local = getLocalSettings()
  console.log('SETTINGS', { server, local })
  return { ...valid.defaults.settings, ...server, ...local, saved: Object.keys(server), }
}

// Event status
// [0: N/A, 1: Pre-Event, 2: Active, 3: Complete]
const getStatus = event => 
  !event ? 0 : !event.roundactive ? 1 : 
  event.roundactive > event.roundcount ? 3 : 2;

export const getEvent = (res, meta, args) => {
  if (meta.response.status === 204) return console.warn(`EVENT <${args}> does not exist`);
  if (res.id) res.status = getStatus(res);
  else Object.keys(res).forEach(id => res[id].status = getStatus(res[id]));
  console.log('EVENT',res);
  return res;
};