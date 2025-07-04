import { useNavigate } from 'react-router-dom'

import { useOpenAlert, useLockScreen } from "../../common/common.hooks"
import { useResetDbMutation } from "../settings.fetch"
import { doReset } from './settingsFetch.services'
import { getLocalSettings, setLocalVar } from "../../common/services/fetch.services"

import { resetDbAlert, resetDbAlertConfirm } from "../../../assets/alerts"
import { resetDataLockCaption } from '../../../assets/constants'
import { settings } from "../../../assets/config"

// Handle clicking ResetDB buttons
export function useResetHandler() {
  const navigate = useNavigate()
  const openAlert = useOpenAlert()
  const [ resetDb, { isLoading } ] = useResetDbMutation()
  useLockScreen(isLoading, resetDataLockCaption)

  return (fullReset) => openAlert(resetDbAlert, 0)
    .then(r => r && openAlert(resetDbAlertConfirm, 1))
    .then(r => r && doReset(resetDb, fullReset, navigate));
}

// Get updated values + push local updates
export function getNewSettings(newData, serverData, dispatch) {
  // Get server data
  let compareData = {}
  serverData.saved.forEach((key) => compareData[key] = serverData[key])

  // Get local data
  Object.assign(compareData, getLocalSettings())

  // Filter out unchanged data
  const newSettings = getUnqiue(newData, compareData);

  // Set local data
  settings.storeLocal.forEach((key) => {
    if (key in newSettings) setLocalVar(key, newSettings[key], dispatch);
    delete newSettings[key];
  });

  // Return server data
  return Object.keys(newSettings).length && newSettings
}



// HELPER -- Runs array.filter on nested arrays (Only calls predicate on non-array elements)
export const deepFilter = (array, predicate) => array.reduce((res,elem,idx) => {
  if (Array.isArray(elem)) res.push(deepFilter(elem, predicate))
  else if (predicate(elem,idx,array)) res.push(elem)
  return res
}, [])

// HELPER -- Returns properties from 'base' that are changed in 'compare'
const getUnqiue = (base, compare = {}) => Object.keys(base).reduce((obj,key) => {
  if (base[key] !== compare[key]) obj[key] = base[key]
  return obj
}, {})